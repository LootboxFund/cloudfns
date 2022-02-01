import { uploadAutoTask } from "./autotask";
// import { createSentinel } from "./sentinel";

const main = async () => {
  try {
    await uploadAutoTask();
  } catch (e) {
    console.log(e);
  }
  try {
    // await createSentinel();
  } catch (e) {
    console.log(e);
  }
};

main();
