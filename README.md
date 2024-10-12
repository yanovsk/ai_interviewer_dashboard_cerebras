# AI Interview Bot Powered by Cerebras Inference (Llama 70B)

Go to 

## Project Overview

This project is an application for the Cerebras fellowship by Dima Yanovsky (yanovsky@mit.edu) and Andrii Zahorodnii (zaho@mit.edu).

**[Link to Loom video demonstration](https://www.loom.com/share/a89d23caffd1427c8005b00890c6db59?sid=f0be9ec1-6b7e-45a7-8f0b-4775748f614b)**

**[Backup Google Drive link to the same video](https://drive.google.com/file/d/1UXm_y8S3-Q02km-F3RcTabgkeTYDF4K8/view?usp=sharing)**

## Summary

We've developed an AI-powered interview bot that conducts personalized audio interviews, transcribes them, and generates tailored reports for both HR and candidates. The system leverages large language models (LLMs) to create custom application forms, generate interview questions, and produce comprehensive post-interview reports.

## How We Built It

Our system comprises several key components:

1. HR Dashboard: For inputting job requirements and interview criteria
2. LLM-powered Form Generator: Creates tailored Google Forms
3. Application Processing Backend: Processes submitted applications and generates personalized interview questions
4. Audio-based AI Interviewer: Conducts the actual interview
5. Report Generator: Analyzes the interview and produces insights

We utilized Llama-70B, running on Cerebras Inference, for various natural language processing tasks throughout the pipeline.

## Leveraging Cerebras' Fast Inference

Our project heavily relies on Cerebras' fast inference capabilities for real-time processing and generation tasks:

1. Instant generation of custom Google Forms based on job requirements
2. Creation of tailored interview questions for each candidate in seconds
3. Near real-time processing of candidate responses during the interview
4. Rapid generation of post-interview reports

The speed and efficiency of Cerebras' inference enable us to provide a seamless, interactive experience for both HR professionals and job candidates.

## Future Roadmap

We plan to enhance the AI Interview Bot in several ways:

1. Implement more sophisticated agents to adjust the interview based on the candidate's responses, allowing for dynamic interview paths.
2. Expand the system's capability to handle multi-round interviews and follow-up questions.

By continuing to leverage Cerebras' powerful inference capabilities, we aim to create an even more intelligent and efficient interviewing tool. We believe that fine-tuning Llama 405B will allow for incredible further development of this project.


## Contributors

- Dima Yanovsky (yanovsky@mit.edu)
- Andrii Zahorodnii (zaho@mit.edu)
