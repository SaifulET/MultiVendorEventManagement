import React from 'react';
import { Check } from 'lucide-react';
import Image from 'next/image';
import img from "@/public/whychoose.svg"
interface FeatureProps {
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ title, description }) => {
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B74140] flex items-center justify-center">
        <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
      </div>
      <div className="flex-1">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
          {title}
        </h3>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const WhyChooseEvenit: React.FC = () => {
  const features = [
    {
      title: 'All-in-One Solution',
      description: 'Everything you need for your event from a single trusted provider',
    },
    {
      title: 'Professional Quality',
      description: 'Premium equipment and experienced staff for flawless execution',
    },
    {
      title: 'Flexible Packages',
      description: 'Customizable services to fit your budget and vision',
    },
  ];

  return (
    <section className="bg-[#F8ECEC] px-[32px] md:px-[112px] py-[32px] md:py-[64px]">
      <div className="">
        {/* Title */}
        <h2 className="font-inter font-bold text-4xl leading-10 tracking-normal text-center text-gray-900 mb-8 md:mb-12">
          Why Choose EVENT?
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] lg:gap-[48px] items-center">
          {/* Features List */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            {features.map((feature, index) => (
              <Feature
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative w-[584px] h-[264px] aspect-[16/10] md:aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={img}
                alt="Professional event setup with elegant chandelier and staff"
               
                className="object-cover"
               width={584}
                height={264}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseEvenit;