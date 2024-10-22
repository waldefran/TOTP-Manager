// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    // Dados de exemplo para teste
    const sampleAccounts = [
        {
            id: '1',
            name: 'Google',
            username: 'teste@gmail.com',
            secret: 'JBSWY3DPEHPK3PXP' // Chave de exemplo - NÃO USE EM PRODUÇÃO
        },
        {
            id: '2',
            name: 'GitHub',
            username: 'testuser',
            secret: 'KRSXG5CTMVRXEZLU' // Chave de exemplo - NÃO USE EM PRODUÇÃO
        }
    ];

    // Classe para gerenciar a interface do popup
    class PopupUI {
        constructor() {
            this.initializeElements();
            this.attachEventListeners();
            this.totpManager = new TOTPManager();
            this.updateInterval = null;
        }

        initializeElements() {
            this.accountsList = document.getElementById('accountsList');
            this.addAccountButton = document.getElementById('addAccountButton');
            this.addAccountModal = document.getElementById('addAccountModal');
            this.addAccountForm = document.getElementById('addAccountForm');
            this.searchInput = document.getElementById('searchInput');
        }

        attachEventListeners() {
            this.addAccountButton.addEventListener('click', () => {
                this.addAccountModal.classList.add('show');
            });

            this.addAccountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAccount();
            });

            document.getElementById('cancelAddAccount').addEventListener('click', () => {
                this.addAccountModal.classList.remove('show');
            });

            this.searchInput.addEventListener('input', (e) => {
                this.filterAccounts(e.target.value);
            });
        }

        async updateTOTPCodes() {
            const codeElements = document.querySelectorAll('.code-display');
            const progressElements = document.querySelectorAll('.progress-ring circle');
            
            for (let i = 0; i < codeElements.length; i++) {
                const secret = codeElements[i].dataset.secret;
                const code = await this.totpManager.generateTOTP(secret);
                codeElements[i].textContent = code;
                
                // Atualiza o anel de progresso
                const remaining = this.totpManager.getRemainingSeconds();
                const progress = (remaining / 30) * 100;
                const circle = progressElements[i];
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (progress / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }
        }

        async renderAccounts(accounts) {
            this.accountsList.innerHTML = '';
            
            accounts.forEach(account => {
                const accountElement = document.createElement('div');
                accountElement.className = 'account-card';
                accountElement.innerHTML = `
                    <div class="account-header">
                        <div>
                            <div class="account-name">${account.name}</div>
                            <div class="account-username">${account.username}</div>
                        </div>
                    </div>
                    <div class="totp-code">
                        <svg class="progress-ring" viewBox="0 0 24 24">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="#e2e8f0"
                                stroke-width="2"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="#2563eb"
                                stroke-width="2"
                                stroke-dasharray="62.83185307179586"
                                stroke-dashoffset="0"
                                transform="rotate(-90 12 12)"
                            />
                        </svg>
                        <div class="code-display" data-secret="${account.secret}">------</div>
                        <button class="btn-icon copy-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <span class="copy-success">Copiado!</span>
                    </div>
                `;

                // Adiciona evento de cópia
                const copyButton = accountElement.querySelector('.copy-button');
                const codeDisplay = accountElement.querySelector('.code-display');
                const copySuccess = accountElement.querySelector('.copy-success');

                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(codeDisplay.textContent);
                    copySuccess.classList.add('show');
                    setTimeout(() => {
                        copySuccess.classList.remove('show');
                    }, 2000);
                });

                this.accountsList.appendChild(accountElement);
            });

            // Inicia a atualização dos códigos
            await this.updateTOTPCodes();
            
            // Atualiza a cada segundo
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            
            this.updateInterval = setInterval(() => {
                this.updateTOTPCodes();
            }, 1000);
        }

        filterAccounts(searchTerm) {
            const filtered = sampleAccounts.filter(account => 
                account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            this.renderAccounts(filtered);
        }

        handleAddAccount() {
            const name = document.getElementById('accountName').value;
            const username = document.getElementById('accountUsername').value;
            const secret = document.getElementById('secretKey').value;

            const newAccount = {
                id: Date.now().toString(),
                name,
                username,
                secret
            };

            sampleAccounts.push(newAccount);
            this.renderAccounts(sampleAccounts);
            this.addAccountModal.classList.remove('show');
            this.addAccountForm.reset();
        }
    }

    // Inicializa a UI
    const popupUI = new PopupUI();
    await popupUI.renderAccounts(sampleAccounts);
});