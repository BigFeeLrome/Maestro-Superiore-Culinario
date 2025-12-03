// Definitions for PDFMake to avoid "@ts-ignore" everywhere
declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any;
  export = pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: any;
  export = pdfFonts;
}

// Support for Web Speech API
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
