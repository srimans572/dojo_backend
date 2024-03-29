const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.use(cors());

const API_KEY = process.env.OPEN_AI_KEY;

app.post("/index.js", async (req, res) => {
  const skill = req.body.skilltype_;
  let firstpart = '';
  let explanatory_text = '';
  let structure = '{"#":{"question":"question","choices":["choice "],"correct_answer":"answer"}';

  if (req.body.explanations == "Yes") {
    structure = '{"#":{"question":"question","choices":["choice "],"correct_answer":"answer", "explanation":"correct_explanation"}';
    explanatory_text = "Provide a 2 sentence explanation on why the answer is correct solely based on evidence in the given paragraph";
  }

  if (skill == "MI") {
    firstpart = `Based on those 5 passages, generate only difficult multiple-choice main idea question behind the passage multiple choice question with 4 answer choices. There must be one question for each passage, with the question including the title of the passage. There must be 5 questions in total. There should be no letter labels before answer choices. The answer choices should not have any labels. The answer choices must be tricky to choose from, with all being related to the passage. Example: The main idea of the passage {title} is... ` + ` ${explanatory_text}` + ` Structure it in this JSON format every time so that the JSON object can be read without any errors:`;
  }

  if (skill == "V") {
    firstpart = `Based on those 5 passages, pick a word that is used in a different context and ask for the meaning of the word in that context or ask for the definition of a difficult word. These should replicate the vocabulary question on the SAT administered by the College Board. Only ask these types of questions and nothing else. There should be 5 questions, with 4 choices each (multiple-choice questions), one for each passage. There should be no letter labels before answer choices. Here is an example: Based on the passage {title}, the word {word} most nearly means... . The answer choices should be in the form of a synonym or antonyms of the chosen word and the correct answer should be the one that suits the context` + ` ${explanatory_text}` + ` Structure it in this JSON format every time so that the JSON object can be read without any errors:`;
  }

  if (skill == "I") {
    firstpart = `Based on those 5 passages, write 5 questions that are based on inferences. These should replicate the inference questions on the SAT administered by the College Board. An example is: Based on this passage {title}, what can be inferred about... or something along those lines. Make them difficult and make the answer choices hard to choose from. Only ask these types of questions and nothing else. There should be 5 questions, with 4 choices each (multiple-choice questions), one for each passage. There should be no letter labels before answer choices.` + ` ${explanatory_text}` + ` Structure it in this JSON format every time so that the JSON object can be read without any errors:`;
  }

  if (skill == "E") {
    firstpart = `Based on the passage write 3 pairs of paired multiple-choice questions for each passage (so 6 in total). The first question should ask for something relevant in the passage (this question must be challenging and difficult to answer, it should be a claim and one sentence in length). The answer to the first choice must not be mentioned explicitly in the passage anywhere. The second question should ask for evidence for the correct answer to the first question in the form of direct textual evidence from the passage. The second questions should include answer choices that are direct textual evidence. The questions must be similar to how CollegeBoard writes the Evidence-Based Questions for the SAT. The questions must be difficult! There should be 6 questions in total, with 4 choices each (multiple-choice questions).  There should be no letter labels before answer choices.` + ` ${explanatory_text}` + ` Structure it in this JSON format every time so that the JSON object can be read without any errors:`;
  }

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY} `,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "user",
          content: req.body.passage + `${firstpart}` + `${structure}` + "You must structure it in the way instructed to not create any errors." + "The 'correct_answer' must have the complete correct answer that is from the choices." + `The questions and choices must be in ${req.body.language} at all times no matter what.`,
        },
      ],
    }),
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log("Your server is running on PORT " + PORT));
