const { OpenAI } = require("openai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateGoogleFormJSON(userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Generate Google Forms JSON based on the provided schema. Do not ask for email.",

        },
        {
          role: "user",
          content: `${userPrompt}. Do not ask for email in the application form.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "google_forms_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["text", "paragraph"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    required: { type: "boolean" },
                  },
                  required: ["type", "title", "description", "required"],
                  additionalProperties: false, // Ensure no additional properties are allowed
                },
              },
            },
            required: ["title", "questions", "description"],
            additionalProperties: false, // Ensure no additional properties are allowed at the root level
          },
        },
      },
    });
    const jsonResponse = JSON.parse(response.choices[0].message.content);
    return convertToGoogleFormsAPIFormat(jsonResponse);
  } catch (error) {
    console.error("Error creating completion:", error);
    throw error;
  }
}

async function generateInterviewQuestionsJSON(userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      
      messages: [
        {
          role: "system",
          content: `
            ###instructions
            you are a smart interviewer bot which was created to choose the best people to match specific qualifications. look at this resume of a data analyst who is currently being interviewed asking some specific questions to get to know whether applicant is really suitable. ask questions that somehow correlate with what applicant wrote in their CV. create a smooth transition between interview questions, so that it sounds more like a dialogue rather than just asking questions. make transitions sound as human-like as possible, make each of them unique but quite simple (e.g. Got it! Moving on to the next question) last thing the interviewer say has to contain no question, just goodbyes
             Generate an array of interview questions based on the provided information. The format should be an object with a 'questions' key, which is an array of objects with 'questionNumber' and 'question'.
            ###input source
            you'll be given a CV of an applicant. each user prompt will contain this data, formulate your output based on it
            ###output format
            you will give answers in json format. your json needs to contain 10 objects, each object corresponding to each question you've generated. introduce yourself in object №1 and object №10 has to be conclusion and goodbye. strictly follow json format below
            `,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "interview_questions_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionNumber: { type: "integer" },
                    question: { type: "string" },
                  },
                  required: ["questionNumber", "question"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0].message.content).questions;
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
       
      messages: [
        {
          role: "system",
          content: `
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
            `, 
        },
        {
          role: "user",
          content: `### Interview requirements ${interviewReqs}\n ### Applicant filled out application form ${filledApplicationForm}`,
        },
        
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "interview_questions_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionNumber: { type: "integer" },
                    question: { type: "string" },
                  },
                  required: ["questionNumber", "question"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0].message.content).questions;
  } catch (error) {
    console.error("Error creating interview questions:", error);
    throw error;
  }
}

async function generateReportTemplate(userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates a report template for evaluating job candidates. The report should include categories and judging criteria that explain what grades 1, 2, and 3 mean for each category. The maximal amount of judging createria is 4. You are able to provide only 10 words per grade per criteria.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "report_template_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    judging_criteria: { type: "string" },
                  },
                  required: ["category", "judging_criteria"],
                  additionalProperties: false,
                },
              },
            },
            required: ["categories"],
            additionalProperties: false,
          },
        },
      },
    });

    // Log the raw response content

    const jsonResponse = JSON.parse(response.choices[0].message.content);
    return jsonResponse;
  } catch (error) {
    console.error("Error creating report template:", error);
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
