import React from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import WelcomeBanner from '../../components/WelcomeBanner';
import Recomended from "../../components/Recomended";
import Features from "../../components/Features";
import ServiceCategories from "../../components/ServiceCategories";
import TransformationCTA from "../../components/TransformationCTA";
import ContactForm from "../../components/form/ContactForm";

import '../../styles/global.css';

const Home = () => {
  return (
    <div className="page">
      <Header />
      <main>
        <WelcomeBanner />
        <Recomended />
        <Features />
        <ServiceCategories />
        <TransformationCTA />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default Home;