import { ethers } from "ethers";
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import {
    Address,
    BLOCKCHAINS,
    chainIdHexToSlug,
    UserID,
    Lootbox_Firestore,
    LootboxTournamentSnapshot_Firestore,
    Tournament_Firestore,
    EnqueueLootboxDepositEmailRequest,
} from "@wormgraph/helpers";
import LootboxCosmicABI from "@wormgraph/helpers/lib/abi/LootboxCosmic.json";
import { fun } from "../api/firebase";
import { manifest } from "../manifest";
import { getLootbox, getLootboxTournamentSnapshot, markDepositEmailAsSent } from "../api/firestore";
import { getTournamentByID } from "../api/firestore/tournament";
import { promiseChainDelay } from "../lib/promise";
import { getCompletedClaimsForLootbox } from "../api/firestore/referral";
import * as auth from "../api/auth";

const EMAIL_BATCH_SIZE = 30; // Increment this as our IP warms...
const REGION = manifest.cloudFunctions.region;
type taskQueueID = "emailUserBatch";
const buildTaskQueuePath = (taskQueueID: taskQueueID) => `locations/${REGION}/functions/${taskQueueID}`;

export interface DepositFragment {
    tokenAddress: Address;
    tokenAmount: string;
}

export interface Deposit extends DepositFragment {
    tokenSymbol: string;
    decimal: string;
}

export const batcher = <T>(values: T[], batchSize = 450): T[][] => {
    const result: T[][] = [];
    const _arr = values.slice();
    while (_arr.length) {
        result.push(_arr.splice(0, batchSize));
    }
    return result;
};

interface EmailUserBatchData {
    type: "deposit";
    deposits: Deposit[];
    userIDs: UserID[];
}

export const emailUserBatch = functions
    .region(REGION)
    .runWith({
        timeoutSeconds: 540,
        failurePolicy: false,
    })
    .tasks.taskQueue({
        retryConfig: {
            maxAttempts: 1,
        },
    })
    .onDispatch(async (data: EmailUserBatchData) => {
        logger.info("emailUserBatch", data);
        try {
            const users = await auth.getUsers(data.userIDs);
            logger.info("Found users", { UserCount: users.length });
            const validUsers = users.filter((user) => !!user.email && !!user.emailVerified);
            logger.info("Valid Users", { ValidUserCount: validUsers.length });

            // TODO: Send emails VIA sendgrid SDK
        } catch (err) {
            logger.error("Error sending user emails", err);
        }

        return;
    });

// See warm up guidelines: https://twilio-cms-prod.s3.amazonaws.com/documents/Generic_IP_Warmup_Schedule.pdf
export const enqueueLootboxDepositEmail = functions
    .region(REGION)
    .https.onCall(async (data: EnqueueLootboxDepositEmailRequest, context) => {
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            throw new functions.https.HttpsError("unauthenticated", "Unauthenticated");
        }

        let lootbox: Lootbox_Firestore | undefined;
        let lootboxTournamentSnapshot: LootboxTournamentSnapshot_Firestore | undefined;
        let tournament: Tournament_Firestore | undefined;

        try {
            [lootbox, lootboxTournamentSnapshot, tournament] = await Promise.all([
                getLootbox(data.lootboxID),
                getLootboxTournamentSnapshot(data.lootboxID, data.tournamentID),
                getTournamentByID(data.tournamentID),
            ]);
        } catch (err) {
            logger.error("Error getting data", err);
            throw new functions.https.HttpsError("internal", "Error fetching Lootbox data");
        }

        if (!lootbox) {
            throw new functions.https.HttpsError("not-found", "Lootbox not found");
        }

        if (!lootbox.address) {
            throw new functions.https.HttpsError("not-found", "Lootbox has not be deployed to the blockchain");
        }

        if (!lootboxTournamentSnapshot || !tournament || !data.chainIDHex) {
            logger.error("Tournament not found");
            throw new functions.https.HttpsError("not-found", "Tournament not found");
        }

        if (tournament.creatorId !== context.auth.uid) {
            logger.error("Caller does not have permission", {
                caller: context.auth.uid,
                tournamnetCreatorIDSnap: lootboxTournamentSnapshot.creatorID,
                tournamentCreatorID: tournament.creatorId,
            });
            throw new functions.https.HttpsError("unauthenticated", "Unauthorized");
        }

        if (lootboxTournamentSnapshot.timestamps.depositEmailSentAt != null) {
            // only allow them to email once
            logger.error("Deposit email already sent", {
                caller: context.auth.uid,
                tournamentID: data.tournamentID,
                lootboxID: data.lootboxID,
            });
            throw new functions.https.HttpsError("already-exists", "Deposit email already sent");
        }

        const chainSlug = chainIdHexToSlug(data.chainIDHex);
        if (!chainSlug) {
            logger.error("Invalid chain ID", {
                caller: context.auth.uid,
                chainIDHex: data.chainIDHex,
            });
            throw new functions.https.HttpsError("invalid-argument", "Invalid chain ID");
        }

        const chain = BLOCKCHAINS[chainSlug];
        if (!chain || !chain?.rpcUrls[0]) {
            logger.error("Chain not found", {
                caller: context.auth.uid,
                chainIdHex: data.chainIDHex,
                chainSlug,
                rpcUrls: chain?.rpcUrls,
            });
            throw new functions.https.HttpsError("not-found", "Chain not found");
        }

        const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]);

        const tokenData: {
            [key: Address]: {
                decimals: string;
                symbol: string;
            };
        } = {
            [ethers.constants.AddressZero as Address]: {
                decimals: `${chain.nativeCurrency.decimals}`,
                symbol: chain.nativeCurrency.symbol,
            },
        };
        const ERC20_ABI = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"];

        const convertDepositFragmentToDeposit = async (fragment: DepositFragment) => {
            let symbol: string;
            let decimal: string;
            if (tokenData[fragment.tokenAddress]) {
                symbol = tokenData[fragment.tokenAddress].symbol;
                decimal = tokenData[fragment.tokenAddress].decimals;
            } else {
                logger.info("Fetching erc20 details", { tokenAddress: fragment.tokenAddress });
                const erc20Token = new ethers.Contract(fragment.tokenAddress, ERC20_ABI, provider);
                try {
                    symbol = await erc20Token.symbol();
                    logger.info("got symbol", { symbol, tokenAddress: fragment.tokenAddress });
                } catch (err) {
                    symbol = fragment.tokenAddress?.slice(0, 4) + "..." || "";
                }
                try {
                    decimal = await erc20Token.decimals();
                    logger.info("got decimals", { decimal, tokenAddress: fragment.tokenAddress });
                } catch (err) {
                    decimal = "18";
                }
            }
            return {
                tokenSymbol: symbol,
                tokenAmount: fragment.tokenAmount,
                tokenAddress: fragment.tokenAddress,
                decimal: decimal,
            };
        };
        let lootboxDeposits: Deposit[] = [];
        try {
            // Get all deposit information about the lootbox
            // const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]);
            logger.info("Getting lootbox data", { lootboxAddress: lootbox.address, chain });
            const lootboxContract = new ethers.Contract(lootbox.address, LootboxCosmicABI, provider);
            logger.info("Getting lootbox deposits", { lootboxAddress: lootbox.address, chain });
            const deposits = await lootboxContract.viewAllDeposits();
            logger.info("Got deposits", { deposits, lootboxAddress: lootbox.address, chain });

            const res: DepositFragment[] = [];
            for (const deposit of deposits) {
                if (deposit?.nativeTokenAmount && deposit?.nativeTokenAmount?.gt("0")) {
                    res.push({
                        tokenAddress: ethers.constants.AddressZero as Address,
                        tokenAmount: deposit.nativeTokenAmount.toString(),
                    });
                }
                if (deposit?.erc20TokenAmount && deposit?.erc20TokenAmount?.gt("0")) {
                    res.push({
                        tokenAddress: deposit.erc20Token,
                        tokenAmount: deposit.erc20TokenAmount.toString(),
                    });
                }
            }
            const _lootboxDeposits = await promiseChainDelay<Deposit>(res.map(convertDepositFragmentToDeposit));
            lootboxDeposits = _lootboxDeposits.reduce<Deposit[]>((a, b) => {
                const deposit = a.find((d) => d.tokenAddress === b.tokenAddress);
                if (deposit) {
                    deposit.tokenAmount = ethers.BigNumber.from(deposit.tokenAmount)
                        .add(ethers.BigNumber.from(b.tokenAmount))
                        .toString();
                } else {
                    a.push(b);
                }
                return a;
            }, []);
        } catch (err) {
            console.error("Error loading deposits", err);
            throw new functions.https.HttpsError("internal", "Error loading deposits. Please try again later.");
        }

        let uniqueUserIDs: UserID[] = [];
        try {
            // Now find all the users and enqueue batches of them
            logger.info("Getting claims", { tournamentID: data.tournamentID });
            const claims = await getCompletedClaimsForLootbox(lootbox.id);
            logger.info("Got claims", { numberOfClaims: claims.length, tournamentID: data.tournamentID });
            // Just get Unique User IDs to batch over
            uniqueUserIDs = Array.from(new Set(claims.map((c) => c.claimerUserId))).filter(
                (a) => a != undefined
            ) as UserID[];
            logger.info("Got unique user IDs", {
                numberOfUniqueUserIDs: uniqueUserIDs.length,
                tournamentID: data.tournamentID,
            });
        } catch (err) {
            console.error("Error loading claims", err);
            throw new functions.https.HttpsError("internal", "An error occured. Please try again later.");
        }

        const userIDBatches = batcher(uniqueUserIDs, EMAIL_BATCH_SIZE);
        logger.info("Created user batches", {
            batchSize: EMAIL_BATCH_SIZE,
            numberOfBatches: userIDBatches.length,
        });

        try {
            // Lets mark this here before enqueuing any tasks
            await markDepositEmailAsSent(lootbox.id, tournament.id);
            const queue = fun.taskQueue(buildTaskQueuePath("emailUserBatch"));
            const enqueues = [];

            for (const userIDBatch of userIDBatches) {
                logger.info("Enqueuing batch", { batchSize: EMAIL_BATCH_SIZE, numberOfUsers: userIDBatch.length });
                const taskData: EmailUserBatchData = {
                    type: "deposit",
                    deposits: lootboxDeposits,
                    userIDs: userIDBatch,
                };
                enqueues.push(queue.enqueue(taskData));
            }

            await Promise.all(enqueues);

            return;
        } catch (err) {
            logger.error("Error enqueuing email batches", err);
            throw new functions.https.HttpsError("internal", "An error occured. Please try again later.");
        }
    });
