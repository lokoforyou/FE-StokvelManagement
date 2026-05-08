import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container" [class.open]="isOpen()">
      <!-- Chat Toggle Button -->
      <button class="chat-toggle shadow-lg" (click)="toggle()">
        <i class="bi" [class.bi-chat-right-dots-fill]="!isOpen()" [class.bi-x-lg]="isOpen()"></i>
      </button>

      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="chat-window shadow-lg border-0 d-flex flex-column animate-slide-in">
          <div class="chat-header p-3 bg-primary text-white d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="bot-avatar me-2 bg-white text-primary rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-robot fs-5"></i>
              </div>
              <div>
                <div class="fw-bold lh-1">Stokvel Buddy</div>
                <div class="small opacity-75">AI Assistant</div>
              </div>
            </div>
            <button class="btn btn-link text-white p-0" (click)="toggle()">
               <i class="bi bi-dash-lg"></i>
            </button>
          </div>

          <div class="chat-body flex-grow-1 p-3 overflow-auto">
            @for (msg of messages(); track $index) {
              <div class="message mb-3" [class.user]="msg.role === 'user'">
                <div class="message-content p-2 px-3 rounded-4 shadow-sm" 
                     [class.bg-primary]="msg.role === 'user'"
                     [class.text-white]="msg.role === 'user'"
                     [class.bg-white]="msg.role === 'assistant'"
                     [class.text-dark]="msg.role === 'assistant'">
                  {{ msg.text }}
                </div>
              </div>
            }
            @if (loading()) {
              <div class="message">
                <div class="message-content p-2 px-3 rounded-4 shadow-sm bg-white text-dark d-flex align-items-center">
                  <div class="dot-typing">
                    <span></span><span></span><span></span>
                  </div>
                  <span class="ms-2 small text-muted">Stokvel Buddy is thinking...</span>
                </div>
              </div>
            }
          </div>

          <div class="chat-footer p-3 bg-white border-top">
            <form (ngSubmit)="send()" class="d-flex gap-2">
              <input type="text" class="form-control rounded-pill px-3" name="userInput" [(ngModel)]="ngModelInput" 
                     placeholder="Ask Stokvel Buddy..." [disabled]="loading()" autocomplete="off" />
              <button type="submit" class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" 
                      style="width: 40px; height: 40px;" [disabled]="loading() || !ngModelInput.trim()">
                <i class="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-container { position: fixed; bottom: 30px; right: 30px; z-index: 2000; }
    .chat-toggle { 
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); 
      color: white; font-size: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .chat-toggle:hover { transform: scale(1.1) rotate(5deg); }
    .chat-window {
      position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px;
      background: #f0f2f5; border-radius: 20px; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    
    .bot-avatar { width: 35px; height: 35px; }
    .chat-body { scrollbar-width: thin; }
    .message { display: flex; flex-direction: column; }
    .message.user { align-items: flex-end; }
    .message-content { max-width: 85%; font-size: 0.85rem; line-height: 1.4; }
    
    /* Dot Typing Animation */
    .dot-typing { display: flex; align-items: center; }
    .dot-typing span { width: 4px; height: 4px; margin: 0 1px; background: #999; border-radius: 50%; animation: dot-blink 1.4s infinite both; }
    .dot-typing span:nth-child(2) { animation-delay: 0.2s; }
    .dot-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
  `]
})
export class ChatboxComponent {
  private api = inject(ApiService);

  isOpen = signal(false);
  loading = signal(false);
  ngModelInput = "";
  messages = signal<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Hi! I am Stokvel Buddy, your AI assistant. How can I help you with your contributions today?' }
  ]);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  send() {
    if (!this.ngModelInput.trim()) return;

    const userMsg = this.ngModelInput;
    this.messages.update(prev => [...prev, { role: 'user', text: userMsg }]);
    this.ngModelInput = "";
    this.loading.set(true);

    this.api.chat(userMsg).subscribe({
      next: (res) => {
        this.messages.update(prev => [...prev, { role: 'assistant', text: res.reply }]);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update(prev => [...prev, { role: 'assistant', text: 'Stokvel Buddy is currently resting. Please try again later.' }]);
        this.loading.set(false);
      }
    });
  }
}
