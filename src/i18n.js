import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "heroTitle": "Experience the Future of Shopping",
      "heroSubtitle": "Exclusive deals for e-MART members. Join today and start saving with our unique point redemption system.",
      "getCard": "Get Your e-MART Card",
      "limitedTime": "Limited Time Deals",
      "megaOffers": "Mega Offers",
      "shopCategory": "Shop by Category",
      "categorySub": "Explore our wide range of products across various categories. Find exactly what you need.",
      "explore": "Explore",
      "home": "Home",
      "welcome": "Welcome",
      "login": "Login",
      "signup": "Sign Up",
      "myOrders": "My Orders",
      "logout": "Logout"
    }
  },
  hi: {
    translation: {
      "heroTitle": "खरीदारी के भविष्य का अनुभव करें",
      "heroSubtitle": "e-MART सदस्यों के लिए विशेष सौदे। आज ही जुड़ें और हमारी अनूठी पॉइंट रिडेम्पशन प्रणाली के साथ बचत करना शुरू करें।",
      "getCard": "अपना e-MART कार्ड प्राप्त करें",
      "limitedTime": "सीमित समय के सौदे",
      "megaOffers": "मेगा ऑफर्स",
      "shopCategory": "श्रेणी के अनुसार खरीदारी करें",
      "categorySub": "विभिन्न श्रेणियों में हमारे उत्पादों की विस्तृत श्रृंखला का अन्वेषण करें। वास्तव में वह खोजें जो आपको चाहिए।",
      "explore": "अन्वेषण करें",
      "home": "होम",
      "welcome": "स्वागत",
      "login": "लॉग इन",
      "signup": "साइन अप",
      "myOrders": "मेरे आदेश",
      "logout": "लॉग आउट"
    }
  },
  mr: {
    translation: {
      "heroTitle": "खरेदीच्या भविष्याचा अनुभव घ्या",
      "heroSubtitle": "e-MART सदस्यांसाठी खास सौदे. आजच सामील व्हा आणि आमच्या अद्वितीय पॉइंट रिडेम्पशन सिस्टमसह बचत करणे सुरू करा.",
      "getCard": "तुमचे e-MART कार्ड मिळवा",
      "limitedTime": "मर्यादित काळासाठी सौदे",
      "megaOffers": "मेगा ऑफर्स",
      "shopCategory": "श्रेणीनुसार खरेदी करा",
      "categorySub": "विविध श्रेणींमध्ये आमच्या उत्पादनांची विस्तृत श्रेणी एक्सप्लोर करा. आपल्याला नेमके काय हवे आहे ते शोधा.",
      "explore": "एक्सप्लोर करा",
      "home": "होम",
      "welcome": "स्वागत आहे",
      "login": "लॉगिन",
      "signup": "साइन अप",
      "myOrders": "माझ्या ऑर्डर्स",
      "logout": "लॉगआउट"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
