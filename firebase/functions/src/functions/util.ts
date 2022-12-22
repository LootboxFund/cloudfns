import { gcs } from "../api/firebase";
import * as functions from "firebase-functions";
import mkdirp from "mkdirp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { manifest } from "../manifest";
// import TranscoderServiceClientV1 from "@google-cloud/video-transcoder";
// const { TranscoderServiceClient } = TranscoderServiceClientV1;
// import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const REGION = manifest.cloudFunctions.region;

// Conversion function for changing mp4 to webm
// originally from https://github.com/Scew5145/FirebaseVideoConvertDemo
export const mp4_to_webm = functions
    .region(REGION)
    .runWith({
        // Ensure the function has enough memory and time
        // to process large files
        timeoutSeconds: 540,
        memory: "8GB",
    })
    .storage.object()
    .onFinalize(async (object) => {
        // const MP4_EXTENSION = "mp4";
        const WEBM_EXTENSION = "webm";
        // const GIF_EXTENSION = "gif";
        const JPEG_EXTENSION = "jpeg";
        const TEMP_LOCAL_FOLDER = "/tmp/";

        const filePath = object.name || "";
        const filePathSplit = filePath.split("/");
        const fileName = filePathSplit.pop() || "";
        // Type Checking for the uploaded item
        if (object.contentType != "video/mp4") {
            console.log("Item ", fileName, "is not a mp4 video.");
            return;
        }
        return new Promise((res, rej) => {
            const run = async () => {
                const fileNameSplit = fileName.split(".");
                const fileExtension = fileNameSplit.pop();
                const baseFileName = fileNameSplit.join(".");
                const fileDir = filePathSplit.join("/") + (filePathSplit.length > 0 ? "/" : "");

                if (!filePath || !fileName || !fileExtension) {
                    console.log(
                        `Missing one of these: filePath=${filePath}, fileName=${fileName}, fileExtension=${fileExtension}`
                    );
                    return;
                }

                // const MP4FilePath = `${fileDir}${baseFileName}.${MP4_EXTENSION}`;
                const WEBMFilePath = `${fileDir}${baseFileName}.${WEBM_EXTENSION}`;
                // const GIFFilePath = `${fileDir}${baseFileName}.${GIF_EXTENSION}`;
                const ThumbnailFilePath = `${fileDir}${baseFileName}.${JPEG_EXTENSION}`;
                // const tempLocalMP4File = `${TEMP_LOCAL_FOLDER}${MP4FilePath}`;
                const tempLocalWEBMFile = `${TEMP_LOCAL_FOLDER}${WEBMFilePath}`;
                // const tempLocalGIFFile = `${TEMP_LOCAL_FOLDER}${GIFFilePath}`;

                const tempLocalDir = `${TEMP_LOCAL_FOLDER}${fileDir}`;
                const tempLocalFile = `${tempLocalDir}${fileName}`;

                // Make the temp directory
                await mkdirp(tempLocalDir);

                // Download item from bucket
                const bucket = gcs.bucket(object.bucket);
                await bucket.file(filePath).download({ destination: tempLocalFile });

                console.log("file downloaded to convert. Location:", tempLocalFile);

                // Create the screenshot
                const thumbnailTempName = "screenshot.jpg";
                ffmpeg({ source: tempLocalFile })
                    .screenshot({
                        count: 1,
                        filename: thumbnailTempName,
                        folder: tempLocalDir,
                    })
                    .on("end", async () => {
                        console.log("screenshot created");

                        fs.readdir(tempLocalDir, (err, files) => {
                            files.forEach((file) => {
                                console.log(file);
                            });
                        });
                        console.log("Uploading the thumbnail...");

                        await bucket.upload(`${tempLocalDir}${thumbnailTempName}`, {
                            destination: ThumbnailFilePath,
                        });

                        console.log("Thumbnail jpeg uploaded at", filePath);

                        await ffmpeg({ source: tempLocalFile })
                            // .setFfmpegPath(ffmpegPath.path)
                            .inputFormat(fileExtension)
                            .output(tempLocalWEBMFile)
                            // Uncomment to see frame progress. Change to progress.percent to see bad % completed estimates
                            // .on("progress", function (progress: any) {
                            //     console.log(
                            //         "Processing: " + progress.frames + " frames completed " + `(${progress.percent} %)`
                            //     );
                            // })
                            .on("end", async () => {
                                console.log("ffmpeg ended");
                                console.log("webm created at ", tempLocalWEBMFile);

                                // Just the upload left
                                await bucket.upload(tempLocalWEBMFile, {
                                    destination: WEBMFilePath,
                                });
                                console.log("webm uploaded at", filePath);
                                await bucket.file(WEBMFilePath).makePublic();
                                console.log("made public");
                                res("done");
                            })
                            .on("error", (error: any) => {
                                console.log("ffmpeg error");
                                console.log(error);
                                rej(error);
                            })
                            .run();
                    });
            };
            run();
        });
    });

// 🛑 🛑 🛑 BE CAREFUL ABOUT RECURSIVE CLOUD FUNCTION CALLS!!! 🛑 🛑 🛑
// mp4_to_webm will recursively interact with transcoder if both operate in the same bucket
//
//
// export const transcodeVideo = functions.storage.object().onFinalize(async (object) => {
//     return new Promise((res, rej) => {
//         console.log("Transcoding video...");
//         const namePath = object.name?.split(".");
//         const extension = namePath?.pop();
//         console.log("extension = ", extension);
//         if (extension?.toLowerCase() !== "mp4") return;
//         const transcoderServiceClient = new TranscoderServiceClient();
//         const inputUri = `gs://${object.bucket}/${object.name}`;
//         const outputUri = `gs://${object.bucket}/${namePath?.join(".")}/`;
//         console.log("inputUri = ", inputUri);
//         console.log("outputUri = ", outputUri);
//         const createJobFromPreset = async () => {
//             console.log("Creating job from preset...");
//             // Construct request
//             const request = {
//                 parent: transcoderServiceClient.locationPath(
//                     manifest.googleCloud.projectID,
//                     manifest.googleCloud.region
//                 ),
//                 job: {
//                     inputUri,
//                     outputUri: outputUri,
//                     templateId: "preset/web-hd",
//                 },
//             };

//             // Run request
//             const [response] = await transcoderServiceClient.createJob(request);
//             console.log(`Job: ${response.name}`);
//             res("done");
//         };
//         createJobFromPreset();
//     });
// });

export const retrieveRandomColor = () => {
    const randomHexColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    return randomHexColor;
};
