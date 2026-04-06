<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-adsense-account" content="ca-pub-7504589792018955">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7504589792018955"
     crossorigin="anonymous"></script>
     <script type='text/javascript' src='//pl27570037.revenuecpmgate.com/34/99/0e/34990e9a05d8672f5493d5e7e11af80e.js'></script>
    <title>SL Pro - Innovative Digital Solutions</title>
    <style>
        /* Reset & Base Styles */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        /* Header Styles */
        header {
            text-align: center;
            padding: 60px 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo {
            font-size: 3.5rem;
            font-weight: 800;
            color: white;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            animation: fadeInDown 1s ease-out;
        }

        .tagline {
            font-size: 1.3rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 15px;
            animation: fadeInUp 1s ease-out 0.3s both;
        }

        .subtitle {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.7);
            max-width: 600px;
            margin: 0 auto;
            animation: fadeInUp 1s ease-out 0.6s both;
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 20px;
        }

        /* Grid Layout */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }

        /* Product Cards */
        .product-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(255, 255, 255, 0.3);
            opacity: 0;
            transform: translateY(50px);
            animation: slideInUp 0.8s ease-out forwards;
        }

        .product-card:nth-child(1) { animation-delay: 0.1s; }
        .product-card:nth-child(2) { animation-delay: 0.2s; }
        .product-card:nth-child(3) { animation-delay: 0.3s; }
        .product-card:nth-child(4) { animation-delay: 0.4s; }
        .product-card:nth-child(5) { animation-delay: 0.5s; }

        .product-card:hover {
            transform: translateY(-15px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }

        .product-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
            animation: bounce 2s infinite;
        }

        .product-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 15px;
            color: #2c3e50;
        }

        .product-description {
            font-size: 1rem;
            color: #5a6c7d;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .product-features {
            list-style: none;
            margin-bottom: 25px;
        }

        .product-features li {
            padding: 5px 0;
            color: #7f8c8d;
            position: relative;
            padding-left: 20px;
        }

        .product-features li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 28px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6);
            text-decoration: none;
        }

        /* Footer */
        footer {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            color: rgba(255, 255, 255, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Animations */
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }

        /* Floating Animation for Background Elements */
        .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 15s infinite linear;
        }

        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            left: 10%;
            animation-delay: -2s;
        }

        .shape:nth-child(2) {
            width: 60px;
            height: 60px;
            left: 70%;
            animation-delay: -5s;
        }

        .shape:nth-child(3) {
            width: 100px;
            height: 100px;
            left: 40%;
            animation-delay: -8s;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .logo {
                font-size: 2.5rem;
            }

            .tagline {
                font-size: 1.1rem;
            }

            .products-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }

            .product-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>

    <header>
        <div class="logo">SL Pro</div>
        <div class="tagline">Innovative Digital Solutions</div>
        <div class="subtitle">Empowering businesses with cutting-edge applications and seamless digital experiences</div>
    </header>

    <div class="container">
        <div class="products-grid">
            <!-- e-Pahchaan -->
            <div class="product-card">
                <div class="product-icon">🔐</div>
                <h3 class="product-title">e-Pahchaan</h3>
                <p class="product-description">
                    Advanced identity management system providing secure authentication, authorization, and user management capabilities.
                </p>
                <ul class="product-features">
                    <li>Keycloak Integration</li>
                    <li>Multi-factor Authentication</li>
                    <li>Role-based Access Control</li>
                    <li>SSO Support</li>
                </ul>
                <a href="https://pahchaan.slpro.in" target="_blank" class="cta-button">
                    Explore e-Pahchaan
                </a>
                <a href="https://www.revenuecpmgate.com/kg431zr65?key=ebe6ceeba914eadc4225e1338ae1751b" target="_blank" class="cta-button">
                    Ads
                </a>
            </div>

            <!-- Khojo Search Engine -->
            <div class="product-card">
                <div class="product-icon">🔍</div>
                <h3 class="product-title">Khojo - AI Search Engine</h3>
                <p class="product-description">
                    Powerful AI-driven search engine delivering lightning-fast, contextual results with advanced crawling and indexing.
                </p>
                <ul class="product-features">
                    <li>AI-Powered Search</li>
                    <li>Real-time Indexing</li>
                    <li>Enterprise-grade Security</li>
                    <li>Advanced Analytics</li>
                </ul>
                <a href="https://khojo.slpro.in" target="_blank" class="cta-button">
                    Try Khojo Search
                </a>
            </div>

            <!-- Short Link Generator -->
            <div class="product-card">
                <div class="product-icon">🔗</div>
                <h3 class="product-title">Short Link Generator</h3>
                <p class="product-description">
                    Create, customize, and track shortened URLs with detailed analytics and branded domains for enhanced marketing.
                </p>
                <ul class="product-features">
                    <li>Custom Short URLs</li>
                    <li>Click Analytics</li>
                    <li>QR Code Generation</li>
                    <li>Bulk URL Processing</li>
                </ul>
                <a href="https://shortlink.slpro.in" target="_blank" class="cta-button">
                    Create Short Links
                </a>
            </div>

            <!-- JWT Token Parser -->
            <div class="product-card">
                <div class="product-icon">🛠️</div>
                <h3 class="product-title">JWT Token Parser</h3>
                <p class="product-description">
                    Developer-friendly tool for decoding, validating, and debugging JWT tokens with comprehensive payload analysis.
                </p>
                <ul class="product-features">
                    <li>Token Decoding</li>
                    <li>Signature Verification</li>
                    <li>Payload Analysis</li>
                    <li>Expiration Tracking</li>
                </ul>
                <a href="https://jwtparser.slpro.in" target="_blank" class="cta-button">
                    Parse JWT Tokens
                </a>
            </div>

            <!-- Integrated Chat via LLM -->
            <div class="product-card">
                <div class="product-icon">🤖</div>
                <h3 class="product-title">Samvaad AI</h3>
                <p class="product-description">
                    Intelligent chatbot powered by large language models, providing contextual assistance and seamless user interactions.
                </p>
                <ul class="product-features">
                    <li>GPT Integration</li>
                    <li>Context-aware Responses</li>
                    <li>Multi-language Support</li>
                    <li>Custom Training Data</li>
                </ul>
                <a href="https://samvaad.slpro.in" target="_blank" class="cta-button">
                    Experience AI Chat
                </a>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 SL Pro. All rights reserved. | Building the future of digital solutions.</p>
        <p>Contact us: <a href="mailto:info@slpro.com" style="color: rgba(255,255,255,0.9);">info@slpro.com</a></p>
    </footer>
</body>
</html>
