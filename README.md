# AIBI

**[File with calls to Cerebras Inference](https://github.com/yanovsk/ai_interviewer_dashboard_cerebras/blob/main/backend/cerebrasService.js)**


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

## Leveraging Fast Inference

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

## Contributors

<img src="public/ulta-RGB.webp" alt="Alt text" width="180" >

Made by [ULTA](https://ultacademy.org) students:

- [Yaryna Holoshchuk](https://www.linkedin.com/in/yaryna-holoshchuk-a47560271/)
- [Yarema Kertytsky](https://www.linkedin.com/in/yarema-kertytsky/)
- [Sviatoslav Matviiuk](https://www.linkedin.com/in/sviatoslav-matviiuk/)
- [Dariia Zubova](https://www.linkedin.com/in/dariia-zubova-91a983331/)

With support from ULTA mentors:

- Dima Yanovsky ([yanovsky@mit.edu](mailto:yanovsky@mit.edu))
- Andrii Zahorodnii ([zaho@mit.edu](mailto:zaho@mit.edu))
