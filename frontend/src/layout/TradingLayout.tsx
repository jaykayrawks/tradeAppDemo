import Header from "./Header";
import Footer from "./Footer";
import Content from "./Content";

 export default function TradingLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">

      <Header />
      <Content />
      <Footer />
    </div>
  );
}