const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

let WEBSITE_TITLE = "Weather Forecasting System with Data Mining";
let GMB_KEY = "Research paper";
let PLACE_COUNTRY = "Copenhagen, Denmark";
let PRONOUN = "First person";

let queryObj = {
  welcome: {
    query: `For a welcome section of a ${GMB_KEY},write a relavent headline	that mention the name of the project also write 1 paragraph that summarize its purpose The headline should contain 7-10 words and 50 - 60 characters. The paragraph should contain 20 words 120 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}.`,

    responseFormat: { header: "..", paragraph: ".." },
  },

  about: {
    query: `For an about section of a ${GMB_KEY},write a relavent headline and write 1 paragraph that mentions the Objectives and Goals of the project and another paragraph that talks about how it addresses a specific need or problem. The headline should contain 3-4 words and 20-30 characters. Each paragraph should contain 30 words and 250 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}. Don't use the word 'about'.`,
    responseFormat: {
      header: "..",
      parts: [{ paragraph: ".." }, { paragraph: ".." }],
    },
  },

  gallery: {
    query: `For a gallery section of a ${GMB_KEY}, write a catchy headline. The headline should contain 3-4 words and 20-30 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}. Don't use the word 'gallery'.`,
    responseFormat: { header: ".." },
  },

  methodology: {
    query: `For a methodology section of a ${GMB_KEY}, write a relavent headline. Write 3 paragraphs, the first explaining the research done, the second paragraph talking about the steps taken to complete the project to be writen in points and in the last paragraph mention the processes and hurdles faced. The headline should contain 3-4 words and 20-30 characters. Each paragraph should contain 70 words and 450 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}.`,
    responseFormat: {
      header: "..",
      parts: [{ paragraph: ".." }, { paragraph: ".." }, { paragraph: ".." }],
    },
  },

  results: {
    query: `For a results section of a ${GMB_KEY}, write a catchy headline and write 2 paragraphs that showcases the outcomes and results of this project. The headline should contain 3-4 words and 20-30 characters. Each paragraph should contain 30 words and 250 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}. Don't use the word 'results'.`,
    responseFormat: {
      header: "..",
      parts: [{ paragraph: ".." }, { paragraph: ".." }],
    },
  },

  timeline: {
    query: `For a timeline section of a ${GMB_KEY}, write an appropriate headline and a paragraph that briefly discribes the overall timeline of this project. The headline should contain 3-4 words and 20-30 characters. The paragraph should contain 20 words and 120 characters. Write 5 headlines and paragraphs that talks about the stages of the project mentioning the time as well. The headline should contain 3-4 words and 20-30 characters. The paragraph should contain 20 words and 120 characters. Write it as a ${PRONOUN}. The project is called ${WEBSITE_TITLE}. Don't use the word 'timeline'.`,
    responseFormat: {
      header: "..",
      paragraph: "..",
      parts: [
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
      ],
    },
  },

  our_team: {
    query: `Write a headline for a our team section of a ${GMB_KEY} that is called ${WEBSITE_TITLE}. Then write a paragraph that talks about their experience. The headline should be of 4-5 words, 30-40 characters and the paragraph in exactly 40 - 50 words, 300 - 380 characters. Don't use the words 'our team'`,
    responseFormat: { header: "..", paragraph: ".." },
  },
  resources: {
    query: `Write eye-catchy headline and preview paragraph each for 4 engaging and relavent resources to a ${GMB_KEY}. Each point should contain a headline in 2-4 words, 10-25 characters and the preview paragraph in 10-15 words, 60 - 80 characters`,
    responseFormat: {
      parts: [
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
        { header: "..", paragraph: ".." },
      ],
    },
  },

  contact: {
    query: `Write a concise and clear headline for a contact us section that encourages visitors connect with them to get updates on the project. Then write a supporting paragraph of 20 words for it `,
    responseFormat: { header: "..", paragraph: ".." },
  },
};

let formatStr = (str) => {
  return str
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\r?\n|\r/g, "")
    .replace(`""`, `","`)
    .replace(`" "`, `","`)
    .replace(`". "`, `","`)
    .replace(`"."`, `","`)
    .replace(`, }`, "}")
    .replace(`,}`, "}")
    .replace(`, ]`, "]")
    .replace(`,]`, "]");
};

const formatJSONString = (jsonString) => {
  let str = formatStr(jsonString),
    index = -1;

  if (str[0] !== "{") {
    let open = str.match(/{/gi),
      close = str.match(/}/gi);
    if (open && close && open.length === close.length && str[0] === `"`) {
      str = `{${str}}`;
    } else {
      index = str.indexOf("{");
      str = str.substr(index);
    }
  }

  return str;
};

const getQuery = (query, keys) => {
  let result = "";
  keys.forEach((key, index) => {
    let i = index + 1,
      item = query[key],
      q = item.query;
    result += `${i}. ${q}${q[q.length - 1] === "." ? "" : "."}${
      item.responseFormat === "string"
        ? ""
        : " Answer should be in a following valid JSON structure\n" +
          JSON.stringify(item.responseFormat, null, 2)
    }\n`;
  });
  result += `Do not include any commentry or any prefixes for each one apart from JSON object in answer.`;
  return result;
  // return `Following is the JSON object which contains queries and required response JSON format. Eliminate the property "query" in response. "response" is the place where the expected answer should go. Do not include any commentry apart from JSON object in response. ${JSON.stringify(
  //   query,
  //   null,
  //   2
  // )}`;
};

const extractStr = (obj) => {
  if (obj !== null && typeof obj === "object") {
    let result = "";
    Object.keys(obj).forEach((key) => {
      result +=
        typeof obj[key] === "string" ? obj[key].trim() : extractStr(obj[key]);
      if (result[result.length - 1] !== ".") {
        result += ". ";
      }
    });
    return result.trim();
  }
  return "";
};

const isEveryStringValidInObj = (obj) => {
  let result = true;
  const parse = (data) => {
    if (!result) return;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        parse(item);
      });
    } else if (data !== null && typeof data === "object") {
      let keys = Object.keys(data);
      keys.forEach((key) => {
        parse(data[key]);
      });
    } else if (typeof data === "string") {
      if (!data) result = false;
    }
  };
  parse(obj);
  return result;
};

const formatTextToJSON = (text, query, keys) => {
  let arr = text.trim().split("\n"),
    data = {};
  if (arr.length !== keys.length) {
    arr = text.trim().split(/\n\d./);
    if (arr.length === keys.length) {
      arr[0] = arr[0].substr(3);
    } else {
      return { data, failedKeys: keys };
    }
  } else if (arr.length === keys.length) {
    arr = arr.map((str) => {
      return str.substr(3);
    });
  }
  let failedKeys = [];
  arr.forEach((str, i) => {
    if (data) {
      if (!str || typeof str !== "string") {
        failedKeys.push(keys[i]);
        return;
      }
      let r = formatStr(str);
      format = query[keys[i]].responseFormat;
      if (format === "string") {
        try {
          let obj = JSON.parse(r);
          r = extractStr(obj);
        } catch (e) {}
        if (!r) {
          failedKeys.push(keys[i]);
        } else {
          data[keys[i]] = r;
        }
        return;
      }
      try {
        r = JSON.parse(r);
        if (isEveryStringValidInObj(r)) {
          data[keys[i]] = r;
        } else {
          failedKeys.push(keys[i]);
        }
      } catch (e) {
        console.log("Data is not a valid JSON Object. Attempting to fix it.");
        if (typeof format === "object") {
          r = formatJSONString(r);
        } else {
          r = formatStr(r);
        }

        try {
          r = JSON.parse(r);
          data[keys[i]] = r;
        } catch (e) {
          console.log("Failed to fix the data." + r);
          failedKeys.push(keys[i]);
        }
      }
    }
  });
  if (failedKeys.length) {
    debugger;
  }
  return { data, failedKeys };
};

const convertResult = (result) => {
  let baseKeys = Object.keys(result);
  baseKeys.forEach((key) => {
    if (result[key].responseFormat) {
      result[key] = result[key].responseFormat;
    }
  });
  const parse = (data) => {
    if (Array.isArray(data)) {
      data.forEach((item) => {
        parse(item);
      });
    } else if (typeof data === "object") {
      let objKeys = Object.keys(data);
      objKeys.forEach((key) => {
        let newKey = key;
        if (
          key.toLowerCase() === "tagline" ||
          key.toLowerCase() === "title" ||
          key.toLowerCase() === "headline"
        ) {
          data.header = data[key];
          delete data[key];
          newKey = "header";
        }
        if (
          key !== "parts" &&
          Array.isArray(data[key]) &&
          !baseKeys.includes(key)
        ) {
          data.parts = data[key];
          delete data[key];
          newKey = "parts";
        }
        parse(data[newKey]);
      });
    }
  };
  parse(result);
  return result;
};

// console.log(getQuery());

const retryCount = 4;
let ci = 1;
const api = async (query) => {
  if (ci === 1) {
    console.log(query);
    ci++;
  }

  try {
    let messages = [];
    messages.push(
      {
        role: "system",
        content:
          "You are a helpful assistant that generates website text content based on google my business keys",
      },
      { role: "user", content: query }
    );

    let result = null,
      count = 0;
    while (!result && count < retryCount) {
      let start = Date.now();
      try {
        count++;
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages,
        });
        let timeTaken = Date.now() - start;
        console.log(
          `Total time taken for this request : ${timeTaken / 1000} seconds`
        );
        result = response.data.choices[0].message.content;
        console.log("Api successful");
      } catch (e) {
        if (count === 4) {
          throw new Error(
            `Api failed after even after retrying ${retryCount} times`
          );
        } else {
          console.log("Api Failed. Retrying");
        }
      }
    }
    return result;
  } catch (e) {
    console.log(e);
  }
};

const queryAndFormatResult = async (queryObj, keysInp) => {
  let result = {},
    keys = keysInp,
    count = 0;
  while (keys.length && count <= retryCount) {
    let query = getQuery(queryObj, keys);
    let resultStr = await api(query),
      { data, failedKeys } = formatTextToJSON(resultStr, queryObj, keys);
    result = { ...result, ...data };
    keys = failedKeys;
    count++;
  }
  return result;
};

const main = async () => {
  let keys = Object.keys(queryObj);
  let result = await queryAndFormatResult(queryObj, keys);
  if (Object.keys(result).length !== keys.length) {
    console.log(`Api failed after even after retrying ${retryCount} times`);
    return `Api failed after even after retrying ${retryCount} times`;
  }
  result = convertResult(result);
  let fileData = fs.readFileSync("data.json");
  if (!fileData) {
    fs.writeFileSync("data.json", JSON.stringify([result], null, 2));
    console.log(`Text generated for 1st query.`);
  } else {
    let existingData = JSON.parse(fileData);
    existingData.push(result);
    fs.writeFileSync("data.json", JSON.stringify(existingData, null, 2));
    console.log(`Text generated for ${existingData.length} queries.`);
  }

  return JSON.stringify(result, null, 2);
};

let n = process.argv[2] ? +process.argv[2] : 1;

fs.writeFileSync("data.json", "[]");

for (let i = 0; i < n; i++) {
  main();
}
console.log(
  `${
    n > 1 ? n + " Requests for Api made in parallel. " : ""
  }Waiting for response..`
);
