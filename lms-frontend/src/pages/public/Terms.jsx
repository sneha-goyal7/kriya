import { motion } from "framer-motion";

function Terms() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-12">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
          
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Kriya. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Kriya provides premium, project-driven learning experiences and career matching services. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">2. User Accounts & Security</h2>
            <p className="leading-relaxed mb-4">
              To access certain features of Kriya, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during the registration process.</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
              <li>Never share your account credentials with third parties. Account sharing is strictly prohibited and will result in immediate termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">3. Intellectual Property Rights</h2>
            <p className="leading-relaxed">
              All content provided on Kriya, including but not limited to videos, curriculum, code snippets, project architectures, and cryptographic certificates, are the intellectual property of Kriya or its licensors. You may not reproduce, distribute, publicly display, or create derivative works from our content without explicit written permission. Piracy or unauthorized distribution will lead to legal action and permanent bans.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">4. User Conduct & Project Submissions</h2>
            <p className="leading-relaxed mb-4">
              Kriya is a professional learning ecosystem. When participating in community spaces, forums, or submitting projects for review:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must not submit plagiarized code. All project submissions must be your original work.</li>
              <li>You must maintain professional decorum when interacting with instructors, mentors, and peers.</li>
              <li>You may not use the platform to distribute malware, spam, or any malicious code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Payments, Subscriptions & Refunds</h2>
            <p className="leading-relaxed">
              Certain features and programs require payment. All fees are clearly stated at checkout. 
              <br/><br/>
              <strong>Refund Policy:</strong> We offer a strict 7-day money-back guarantee for all premium programs, provided you have consumed less than 20% of the course material. Refund requests outside this window, or for accounts flagged for violation of these terms, will be denied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">6. Certifications & Career Matching</h2>
            <p className="leading-relaxed">
              Kriya issues cryptographic certificates based on verified competence and project completion. These certificates do not guarantee employment, academic credit, or professional licensure. While Kriya provides career matching services and connects talent with opportunities, we do not guarantee job placement or specific salary outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">7. Termination</h2>
            <p className="leading-relaxed">
              Kriya reserves the right, at its sole discretion, to suspend or terminate your account and access to the platform at any time, without notice or liability, for any reason, including but not limited to a breach of these Terms and Conditions.
            </p>
          </section>
          
          <div className="pt-12 mt-12 border-t border-border/50">
            <p className="text-sm">
              If you have any questions about these Terms, please contact us via our <a href="/feedback" className="text-primary hover:underline">Feedback form</a> or email us at legal@kriya.com.
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Terms;
