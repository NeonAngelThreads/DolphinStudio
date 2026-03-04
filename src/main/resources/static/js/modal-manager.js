/*
 * DolphinStudio - https://github.com/NeonAngelThreads/DolphinStudio
 * Copyright (C) 2025 NeonAngelThreads (https://github.com/NeonAngelThreads)
 *
 *    This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public
 *    License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any
 *    later version.
 *
 *    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 *    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 *    License for more details. You should have received a copy of the GNU General Public License along with this
 *    program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * https://space.bilibili.com/386644641
 */

class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.container = document.getElementById('modal-container');
    }

    show(title, content, onConfirm = null, onCancel = null) {
        const modalHtml = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">${title}</h3>
                    <div class="mb-6">
                        ${content}
                    </div>
                    <div class="flex justify-end space-x-3">
                        ${onCancel ? `
                            <button id="modal-cancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                                ${typeof onCancel === 'string' ? onCancel : 'Cancel'}
                            </button>
                        ` : ''}
                        ${onConfirm ? `
                            <button id="modal-confirm" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                                ${typeof onConfirm === 'string' ? onConfirm : 'Confirm'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = modalHtml;
        this.overlay.classList.remove('hidden');

        if (onCancel) {
            document.getElementById('modal-cancel').addEventListener('click', async () => {
                if (typeof onCancel === 'function') {
                    await onCancel();
                }
                this.hide();
            });
        }

        if (onConfirm) {
            document.getElementById('modal-confirm').addEventListener('click', async () => {
                if (typeof onConfirm === 'function') {
                    await onConfirm();
                }
                this.hide();
            });
        }

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
                if (onCancel) onCancel();
            }
        });
    }

    hide() {
        this.overlay.classList.add('hidden');
        this.container.innerHTML = '';
    }
}