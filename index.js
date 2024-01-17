const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();



app.use(express.json());
app.use(cors())



const API_KEY = process.env.API_KEY_OPEN_AI;

app.post("/", async (req, res) => {
  
  let prompt = "Generate 5 short passages that are always at least 4 sentences each and never ever over 5 sentences. The passages must be unique everytime, never ever do you dare generate a similar passage. These passages must be trying to check for reading comprehension. Keep the subject of the passages diverse and choose any topic the choice is yours.  Give only title of the passage and the text itself and nothing else. Start each generation with a newline character.";

  if (req.body.skilltype_ == "E") {
    prompt = "Generate exactly 1 passage that is at least 10 sentences in length and at max 15 sentences. The only one passage you generate must be about one of these topics from the list: a totally random custom literature realistic fiction excerpt generated purely by you and never done before, any made-up or real excerpt from real historic documents/speeches/text in the periods 1700-1990, made-up or real scientific passages, and a biography of someone important in history. The passage must have different tones and use normal words in different contexts or use difficult words. The passages must not be straightforward and must be a test for reading comprehension. It should be like the passages in the SAT. I just want the passage and no additional text.";
  }

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "user",
          content: prompt + ` The text must always and only be generated in this language: ${req.body.language}. `,
        },
      ],
      temperature: 0.75,
      top_p: 0.8,
      max_tokens: 3700,
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

app.post("/", async (req, res) => {
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

app.post("/script", async (req, res) => {

  let prompt = "You will work as an self-guided tour creator. Today, you'll be creating an indepth self-guided tour for this location: " + req.body.destination + "You will include additional destinations that are popular in the main destination. You will return  a JSON object with the script. You must follow this general structure the JSON this way at all times no matter what: " + '{destinationName: name, howToGetHere: text, moreInfo: information,  spotsToSee: [{location:name, info:info}], eatSpots: [{name:name, info:info}],}';

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt + `I only want you to provide me the JSON and no additional text.`,
        },
      ],
      temperature: 0.75,
      top_p: 0.8,
      max_tokens: 7000,
    
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
