import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Clock, Star, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const { user } = useAuthStore();
  const features = [
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'All products meet strict medical standards and certifications',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Express shipping available for urgent medical supply needs',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service for healthcare professionals',
    },
    {
      icon: Star,
      title: 'Trusted Suppliers',
      description: 'Partnered with leading medical equipment manufacturers',
    },
  ];

  const categories = [
    {
      name: 'Diagnostic Equipment',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      count: '150+ Products',
    },
    {
      name: 'Personal Protection',
      image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
      count: '200+ Products',
    },
    {
      name: 'Patient Care',
      image: 'https://images.unsplash.com/photo-1582719366037-2c4d7c1a0413?w=400',
      count: '120+ Products',
    },
    {
      name: 'Emergency Medical',
      image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
      count: '80+ Products',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Solid navy with red accents */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        
        {/* Red accent circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6 leading-tight">
              Professional <span className="text-primary">Medical Supplies</span> Delivered to Your Door
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Quality medical equipment and supplies for healthcare professionals, hospitals, and clinics. 
              Order with confidence from our curated selection of certified products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="btn-medical inline-flex items-center justify-center gap-2"
              >
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-secondary font-semibold rounded-lg border-2 border-white 
                           hover:bg-secondary-50 transition-all duration-200 text-center inline-flex items-center justify-center"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
          
          <div className="relative animate-fade-in animate-delay-200">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1693264251393-d28f984ca283?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Medical Supplies"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-primary/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-72 h-72 bg-secondary/20 rounded-2xl -z-10" />
          </div>
        </div>
        </div>
      </section>

      {/* Features Section - Light blue background */}
      <section className="bg-secondary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-secondary mb-4">Why Choose APlusMed?</h2>
            <p className="text-gray-600 text-lg">Your trusted partner in medical supply management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-center animate-slide-up border-t-4"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  borderTopColor: index % 2 === 0 ? '#F03C3C' : '#002850'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#F03C3C' : '#002850'
                  }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-neutral mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-neutral mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg">Explore our comprehensive range of medical supplies</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/products"
                className="group card-medical animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-xl mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-200">{category.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* CTA Section - Solid red */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="font-display text-4xl text-white mb-4">
            Ready to Order Medical Supplies?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of healthcare facilities that trust APlusMed for their medical supply needs.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg 
                       hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Get Started Today
            </Link>
          )}
          {user && (
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg 
                       hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Browse Products
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
