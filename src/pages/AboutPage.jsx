import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Truck, Users, ArrowRight, Linkedin, Mail } from 'lucide-react';

const AboutPage = () => {
  const founders = [
    {
      name: 'Arnold',
      title: 'Co-Founder',
      initials: 'A',
      bgColor: '#F03C3C',  // Solid red
      bio: 'With a passion for improving healthcare accessibility, Arnold co-founded APlusMedDepot to bridge the gap between quality medical suppliers and healthcare professionals. His vision drives the platform\'s mission to make certified medical supplies available to every clinic, hospital, and care facility.',
      linkedin: '#',
      email: 'arnold@aplusmeddepot.com',
    },
    {
      name: 'Louie',
      title: 'Co-Founder',
      initials: 'L',
      bgColor: '#002850',  // Solid navy
      bio: 'Louie brings deep operational expertise to APlusMedDepot, ensuring that every order reaches healthcare providers reliably and on time. His focus on building trusted vendor partnerships and streamlined logistics has been key to the platform\'s growth and reputation for quality.',
      linkedin: '#',
      email: 'louie@aplusmeddepot.com',
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Quality First',
      description: 'Every product on our platform is vetted and certified. We work only with verified vendors who meet our strict quality standards.',
    },
    {
      icon: Heart,
      title: 'Healthcare Focused',
      description: 'We exist to serve healthcare professionals. Every decision we make puts patient safety and care quality at the center.',
    },
    {
      icon: Truck,
      title: 'Reliable Delivery',
      description: 'Medical supplies can\'t wait. We\'ve built our logistics network to ensure fast, dependable delivery when it matters most.',
    },
    {
      icon: Users,
      title: 'Trusted Partnerships',
      description: 'From vendors to buyers, we build long-term relationships based on transparency, fairness, and mutual growth.',
    },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="bg-secondary-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-primary/20 rounded-full px-4 py-2 mb-6 text-sm font-semibold text-gray-600">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Our Story
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-neutral mb-6 leading-tight">
            Built for <span className="text-primary">Healthcare.</span>
            <br />Driven by <span className="text-secondary">Purpose.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            APlusMedDepot was founded with one goal: make it effortless for healthcare facilities
            to access the certified medical supplies they need — from trusted vendors, delivered fast.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="font-display text-4xl text-neutral mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We set out to solve a real problem in healthcare procurement: too much friction, 
                too little transparency, and too few trustworthy sources for medical supplies.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                APlusMedDepot is a multi-vendor marketplace that connects certified medical 
                suppliers with hospitals, clinics, pharmacies, and individual healthcare 
                professionals — all in one place, with confidence.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you're stocking an ER or running a family practice, we make sure 
                you have what you need, when you need it.
              </p>
            </div>
            <div className="relative animate-slide-up">
              <div className="bg-white rounded-3xl p-8 shadow-lg border-t-4 border-primary">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: '🏥', title: 'Built for Healthcare', desc: 'Designed from the ground up for clinics, hospitals, and healthcare professionals.' },
                    { icon: '✅', title: 'Verified Vendors Only', desc: 'Every supplier on our platform is reviewed and approved before listing products.' },
                    { icon: '🚀', title: 'Just Getting Started', desc: 'We\'re a new company with big ambitions. Early clients get the best rates and direct founder support.' },
                  ].map(item => (
                    <div key={item.title} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-neutral text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-neutral mb-4">Meet the Founders</h2>
            <p className="text-gray-500 text-lg">Two entrepreneurs united by a shared belief that healthcare deserves better infrastructure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {founders.map((founder) => (
              <div key={founder.name} className="glass-card p-8 animate-slide-up group hover:shadow-xl transition-shadow duration-300">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: founder.bgColor }}>
                  <span className="text-white font-display text-3xl">{founder.initials}</span>
                </div>
                <h3 className="font-display text-2xl text-neutral mb-1">{founder.name}</h3>
                <p className="text-primary font-semibold text-sm mb-4">{founder.title}</p>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">{founder.bio}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <a
                    href={founder.linkedin}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <span className="text-gray-200">|</span>
                  <a
                    href={`mailto:${founder.email}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
                  >
                    <Mail className="w-4 h-4" /> {founder.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-neutral mb-4">What We Stand For</h2>
            <p className="text-gray-500 text-lg">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="glass-card p-6 flex gap-5 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: i % 2 === 0 ? '#F03C3C' : '#002850' }}
                >
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-neutral mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 text-lg mb-8">
            Join APlusMedDepot today — whether you're here to buy or to sell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-secondary border-2 border-white text-white font-semibold rounded-lg hover:bg-secondary-800 transition-colors flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
