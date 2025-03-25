import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Privacy Policy</h1>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">1. Introduction</h2>
        <p class="mb-4">Last updated: March 24, 2025</p>
        <p>
          This privacy policy explains how we collect, use, and protect your
          personal information when you use the Beer Pong Tournament Management
          System.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">2. Data Collection and Usage</h2>
        <p class="mb-4">We collect and process the following information:</p>
        <ul class="list-disc pl-6 mb-4">
          <li>Tournament registration details</li>
          <li>Team information</li>
          <li>User preferences</li>
          <li>Browser type and version</li>
          <li>IP address</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">3. Third-Party Services</h2>
        <p class="mb-4">We use the following third-party services:</p>
        <ul class="list-disc pl-6 mb-4">
          <li>
            <strong>Cloudflare:</strong> We use Cloudflare as a proxy service to
            enhance security and performance. Cloudflare may collect and process
            your IP address and other technical information. For more
            information, please visit
            <a
              href="https://www.cloudflare.com/privacy/"
              class="text-blue-500 hover:underline"
              target="_blank"
              >Cloudflare's Privacy Policy</a
            >.
          </li>
          <li>
            <strong>Font Awesome:</strong> We use Font Awesome for icons. Their
            service may collect usage statistics. For more information, visit
            <a
              href="https://fontawesome.com/privacy"
              class="text-blue-500 hover:underline"
              target="_blank"
              >Font Awesome's Privacy Policy</a
            >.
          </li>
          <li>
            <strong>Buy Me a Coffee:</strong> We integrate with Buy Me a Coffee
            for donations. Their service has its own privacy policy at
            <a
              href="https://www.buymeacoffee.com/privacy"
              class="text-blue-500 hover:underline"
              target="_blank"
              >Buy Me a Coffee Privacy Policy</a
            >.
          </li>
          <li>
            <strong>GitHub:</strong> We link to GitHub for project information.
            GitHub's privacy policy can be found at
            <a
              href="https://docs.github.com/privacy"
              class="text-blue-500 hover:underline"
              target="_blank"
              >GitHub's Privacy Statement</a
            >.
          </li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">4. Hosting Information</h2>
        <p class="mb-4">
          This application is privately hosted in the European Union, adhering
          to GDPR requirements. All data is stored and processed within the EU.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">5. Data Protection</h2>
        <p class="mb-4">
          We implement appropriate technical and organizational measures to
          ensure a level of security appropriate to the risk, including:
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Encryption of data in transit using SSL/TLS</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Regular backups</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">6. Your Rights</h2>
        <p class="mb-4">Under GDPR, you have the following rights:</p>
        <ul class="list-disc pl-6 mb-4">
          <li>Right to access your personal data</li>
          <li>Right to rectification</li>
          <li>Right to erasure</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-3">7. Contact Information</h2>
        <p>
          For any privacy-related questions or requests, please contact us at
          support&#64;dolfus.me/p>
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--color-text-primary);
      }

      a {
        color: var(--color-accent-fg);
      }

      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class PrivacyPolicyComponent {}
