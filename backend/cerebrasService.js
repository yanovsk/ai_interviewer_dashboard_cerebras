const {Cerebras} = require('@cerebras/cerebras_cloud_sdk');
const { ContactlessOutlined } = require("@mui/icons-material");
require("dotenv").config();


const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY, 
});

function parseStringToJson(inputString) {
  try {
    if (inputString.startsWith("```") && inputString.endsWith("```")) {
      inputString = inputString.slice(3, -3).trim();
    }
    const parsedJSON = JSON.parse(inputString);
    return parsedJSON;
  } catch (error) {
    console.error("Failed to parse the string into JSON:", error);
    return null;
  }
}

async function generateGoogleFormJSON(userPrompt) {
  const completionCreateResponse = await cerebrasClient.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
        `
        You are smart JSON job application form generation agent. ONLY RESPOND WITH JSON AND NOTHING ELSE.
            User will provide you job description and you must generate the JSON file corresponding to questions fitting to that job description.


            Here is what schema you must generate:
            Rules:
                - "type" must always be a "text"
                - "title" is the title of the field on the application, e.g. "Full name"
                - "required" can be either true or false
            {
            "title": "This is where you write the title of the job ",
            "description": "Short description of the position.",
            "questions": [
                {
                "type": "text", 
                "title": "Title of the field on the application. E.g Full name ",
                "description": "Description of that field. E.g. Please enter your full name.",
                "required": true
                },
              ]
            }
        `
      },
      {
        role: "user",
        content: `${userPrompt}. Do not ask for email in the application form. ONLY RESPOND WITH JSON AND NOTHING ELSE`,
      },
    ],
    model: 'llama3.1-70b',
  });

  const jsonResponse = parseStringToJson( (await completionCreateResponse).choices[0].message.content);
  console.log("JSON", jsonResponse)
  return convertToGoogleFormsAPIFormat(jsonResponse);

}

async function generateInterviewQuestionsJSON(userPrompt) {
  try{

    const completionCreateResponse = await cerebrasClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
          `
          ### instructions
          You are a smart interviewer bot which was created to choose the best people to match specific qualifications. 
          Generate an array of interview questions based on the provided  information. 
          The format should be an object with a 'questions' key, which is an array of objects with 'questionNumber' and 'question'.
          ### input source
          you'll be given a CV of an applicant. each user prompt will contain this data, formulate your output based on it
          ### output format
          you will give answers in json format. your json needs to contain 10 objects, each object corresponding to each question you've generated. 
          Introduce yourself in object number q and object number 10 has to be conclusion and goodbye. 
          ### strictly follow the sample json format below:
          {
            "questions": [
              {
                "questionNumber": 1,
                "question": "This where you write the question corresponding to the questionNumber"
                },
              ]
            }
          `
          },
          {
            role: "user",
            content: `ONLY RESPOND WITH JSON AND NOTHING ELSE. ${userPrompt}.`,
          },
         ],
            model: 'llama3.1-70b',
          });
          const response = (await completionCreateResponse).choices[0].message.content;
          const jsonResponse = parseStringToJson(response);
          console.log("in question generation", jsonResponse)
          return jsonResponse.questions;
        } catch (error) {
          console.error("Error creating interview questions:", error);
          throw error;
      }
    }


    async function generateCustomInterviewQuestionsJSON(
      interviewReqs,
      filledApplicationForm
      ) {

        try {
        const completionCreateResponse = await cerebrasClient.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
              `
            ###instructions
              you are a smart interviewer bot which was created to choose the best people to match specific qualifications. 
              Generate an array of interview questions based on the provided information. 
              The format should be an object with a 'questions' key, which is an array of objects with 'questionNumber' and 'question'.
            ###input source
              You will be given the following:
                1. Requirement from HR based on which you will generate the questions for the interview
                2. Application form of the applicant for the position, you will need to use this information to formulate the questions.
            ###output format
              you will give answers in json format.
              your json needs to contain 10 objects, each object corresponding to each question you've generated. 
              introduce yourself in object number 1 and object number 10 has to be conclusion and goodbye. strictly follow json format below. Try to fit each question in 10 words.
            ### strictly follow the sample json format below:
            {
              "questions": [
                {
                  "questionNumber": 1,
                  "question": "This where you write the question corresponding to the questionNumber"
                  },
                ]
              }
              `
              },
              {
                role: "user",
                content: `### Interview requirements ${interviewReqs}\n ### Applicant filled out application form ${filledApplicationForm}`,
              },
             ],
                model: 'llama3.1-70b',
              });

              const response = (await completionCreateResponse).choices[0].message.content;
              const jsonResponse = parseStringToJson(response);
              console.log("in question generation", jsonResponse)
              return jsonResponse.questions;


            } catch (error) {
              console.error("Error creating interview questions:", error);
              throw error;
          }
        }

        
async function generateReportTemplate(userPrompt) {
  try{
    const completionCreateResponse = await cerebrasClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
          `
          ### instructions
            You are an assistant that generates a report template for evaluating job candidates. 
            YOU MUST ALWAYS RESPOND IN JSON FORMAT BELOW AND NOTHING ELSE.
            The report should include categories and judging criteria that explain what grades 1, 2, and 3 mean for each category. 
            You must only provide 10 words per grade per criteria.
          ### JSON Response Format
            {
            "categories": [
                {
                "category": "Write a category name here",
                "judging_criteria": "1: This means insufficient 2: Proficient but needs improvement. 3: Master."
                },
                {
                "category": "Example: Communication",
                "judging_criteria": "Example: 1: Poor articulation. 2: Clear but lacks precision. 3: Concise and persuasive."
                },
              ]
            }         
          `
          },
          {
            role: "user",
            content: `ONLY RESPOND WITH JSON AND NOTHING ELSE. ${userPrompt}.`,
          },
         ],
            model: 'llama3.1-70b',
          });
          const response = (await completionCreateResponse).choices[0].message.content;
          return parseStringToJson(response);
        } catch (error) {
          console.error("Error creating interview questions:", error);
          throw error;
      }
  }

function convertToGoogleFormsAPIFormat(json) {
  const emailQuestion = {
    createItem: {
      item: {
        title: "Email",
        description: "Please enter your email address",
        questionItem: {
          question: {
            required: true,
            textQuestion: {},
          },
        },
      },
      location: {
        index: 0,
      },
    },
  };

  const otherQuestions = json.questions.map((question, index) => {
    let questionItem = {
      question: {
        required: question.required,
      },
    };

    if (question.type === "text") {
      questionItem.question.textQuestion = {};
    } else if (question.type === "paragraph") {
      questionItem.question.textQuestion = { paragraph: true };
    }

    return {
      createItem: {
        item: {
          title: question.title,
          description: question.description,
          questionItem: questionItem,
        },
        location: {
          index: index + 1, // +1 to account for the email question
        },
      },
    };
  });

  return {
    requests: [emailQuestion, ...otherQuestions],
  };
}

module.exports = {
  generateGoogleFormJSON,
  generateInterviewQuestionsJSON,
  generateReportTemplate,
  generateCustomInterviewQuestionsJSON,
};
