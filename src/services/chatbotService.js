
import api from "./api";

const sendMessage = async (message, language = "en") => {
  const response = await api.post("/loans/chatbot", {
    message,
    language,
  });

  return response.data;
};

const chatbotService = {
  sendMessage,
};

export default chatbotService;
