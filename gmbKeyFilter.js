const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);
const fs = require("fs"),
  path = require("path");

const gmbList = JSON.parse(
  fs.readFileSync(path.join(__dirname, "gmbList.json"), "utf8")
);
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
async function getChatResponse() {
  try {
    let output = [];
    for (let i = 0; i < gmbList.length; i += 30) {
      console.log("processing", i);
      const gmbListChunk = gmbList.slice(i, i + 30);
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates website text content based on google my business keys",
          },
          {
            role: "user",
            content: `Sort GMB keys that can be categorized as fine dining restaurants designed for providing high quality ingredients, ambiance and presentation. GMB List: ${gmbListChunk.join(
              ", "
            )}}. Give output in { result: [] } format. Don't include any commentary or any prefixes for each one apart from the JSON object in the answer.`,
          },
        ],
      });
      try {
        const result = JSON.parse(
          completion.data.choices[0].message.content
        ).result;
        if (Array.isArray(result) && result.length > 0) {
          output.push(...result);
        }
      } catch (error) {}
      await sleep(10000);
    }

    output = Array.from(new Set(output));
    output = output.filter((x) => gmbList.includes(x));

    console.log(output);
    fs.writeFileSync(
      path.join(__dirname, "genericFineDining2.json"),
      JSON.stringify(output, null, 2)
    );
  } catch (error) {
    console.log(error);
  }
}

// Call the asynchronous function to get the chat response
(async () => {
  await getChatResponse();
})();
