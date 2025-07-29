class QRCodeGenerator {
    constructor() {
        this.linkInput = document.getElementById('linkInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.qrContainer = document.getElementById('qrContainer');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.currentCanvas = null;
        
        this.init();
    }

    init() {
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.linkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateQR();
            }
        });
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        
        this.showPlaceholder();
    }

    showPlaceholder() {
        this.qrContainer.innerHTML = '<div class="placeholder-text">Seu QR Code aparecerá aqui</div>';
        this.qrContainer.classList.remove('has-qr');
        this.downloadBtn.style.display = 'none';
    }

    showLoading() {
        this.qrContainer.innerHTML = '<div class="loading">Gerando QR Code...</div>';
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Gerando...';
    }

    resetButton() {
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = 'Gerar QR Code';
    }

    isValidUrl(string) {
        try {
            if (!string.match(/^https?:\/\//)) {
                string = 'http://' + string;
            }
            new URL(string);
            return string;
        } catch (_) {
            return false;
        }
    }

    async generateQR() {
        const input = this.linkInput.value.trim();
        
        if (!input) {
            alert('Por favor, insira um link!');
            return;
        }

        const validUrl = this.isValidUrl(input);
        if (!validUrl) {
            alert('Por favor, insira um link válido!');
            return;
        }

        this.showLoading();

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(validUrl)}`;
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 300;
                canvas.height = 300;
                
                ctx.drawImage(img, 0, 0, 300, 300);
                
                this.qrContainer.innerHTML = '';
                this.qrContainer.appendChild(canvas);
                this.qrContainer.classList.add('has-qr');
                
                this.currentCanvas = canvas;
                
                this.downloadBtn.style.display = 'block';
                
                this.resetButton();
            };
            
            img.onerror = () => {
                throw new Error('Erro ao carregar QR Code');
            };
            
            img.src = qrUrl;
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            this.qrContainer.innerHTML = '<div style="color: #e53e3e;">Erro ao gerar QR Code. Tente novamente.</div>';
            this.resetButton();
        }
    }

    downloadQR() {
        if (!this.currentCanvas) {
            alert('Nenhum QR Code para baixar!');
            return;
        }

        try {
            this.currentCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `qrcode-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (error) {
            console.error('Erro ao baixar QR Code:', error);
            alert('Erro ao baixar QR Code. Tente novamente.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});