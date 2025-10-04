import React from "react";

export const TrustArchitecture: React.FC = () => {
  return (
    <section className="w-full bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
            Architecting Trust: Five Contracts, One Immutable Truth.
          </h2>
        </div>

        <div className="mt-8 md:mt-10 lg:mt-12 grid grid-cols-1 gap-8 items-center">
          <div className="w-full">
            <img
              src="/contracts-architecture.png"
              alt="Five smart contracts architecture diagram"
              className="mx-auto w-full max-w-5xl h-auto object-contain"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </div>

          <div className="max-w-3xl mx-auto text-center text-muted-foreground text-base md:text-lg leading-relaxed">
            <p>
              Our platform runs on a five-contract blockchain architecture—a decentralized “chain of trust.” Each contract has a defined role, from verifying institutions to securing individual credentials. This structure makes every achievement tamper-proof, scalable, and permanently verifiable without third-party servers..
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustArchitecture;


