// ============================================
// SCAN HISTORY MODULE
// ============================================

class ScanHistory {
    constructor() {
        this.supabase = window.supabaseClient;
        this.auth = window.authManager;
        this.scans = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            dateRange: 'all',
            healthStatus: 'all',
            search: ''
        };

        this.init();
    }

    async init() {
        // Wait for auth to be ready
        setTimeout(async () => {
            if (!this.auth.isAuthenticated()) {
                window.location.href = 'auth.html';
                return;
            }
            
            await this.loadScans();
            this.bindEvents();
        }, 500);
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                const value = e.target.dataset.value;
                this.filters[filter] = value;
                this.applyFilters();
            });
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadScans(true);
            });
        }
    }

    async loadScans(append = false) {
        try {
            const from = (this.currentPage - 1) * this.itemsPerPage;
            const to = from + this.itemsPerPage - 1;

            let query = this.supabase
                .from('scans')
                .select('*')
                .eq('user_id', this.auth.currentUser.id)
                .order('scan_date', { ascending: false })
                .range(from, to);

            // Apply health filter
            if (this.filters.healthStatus !== 'all') {
                query = query.eq('is_healthy', this.filters.healthStatus === 'healthy');
            }

            // Apply date filter
            if (this.filters.dateRange !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (this.filters.dateRange) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                }
                
                if (startDate) {
                    query = query.gte('scan_date', startDate.toISOString());
                }
            }

            const { data, error } = await query;

            if (error) throw error;

            if (append) {
                this.scans = [...this.scans, ...data];
            } else {
                this.scans = data;
            }

            this.renderScans();
            this.updateStats();

        } catch (error) {
            console.error('Error loading scans:', error);
        }
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadScans();
    }

    renderScans() {
        const container = document.getElementById('scans-grid');
        if (!container) return;

        let filteredScans = this.scans;

        // Apply search filter
        if (this.filters.search) {
            filteredScans = filteredScans.filter(scan => 
                scan.plant_name?.toLowerCase().includes(this.filters.search) ||
                scan.diseases?.some(d => d.name?.toLowerCase().includes(this.filters.search))
            );
        }

        if (filteredScans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🌱</span>
                    <h3>No scans yet</h3>
                    <p>Start by scanning your first plant!</p>
                    <a href="index.html" class="btn btn-primary">Scan Now</a>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredScans.map(scan => this.renderScanCard(scan)).join('');
    }

    renderScanCard(scan) {
        const diseases = scan.diseases || [];
        const topDisease = diseases[0];

        return `
            <div class="scan-card ${scan.is_healthy ? 'healthy' : 'diseased'}" 
                 data-id="${scan.id}">
                <div class="scan-image">
                    <img src="${scan.image_url}" alt="${scan.plant_name}" loading="lazy">
                    <div class="health-badge ${scan.is_healthy ? 'healthy' : 'diseased'}">
                        ${scan.is_healthy ? '✅ Healthy' : '⚠️ Issues'}
                    </div>
                    ${scan.is_favorite ? '<span class="favorite-badge">⭐</span>' : ''}
                </div>
                
                <div class="scan-info">
                    <h4 class="plant-name">${scan.plant_name || 'Unknown Plant'}</h4>
                    <p class="scan-date">${this.formatDate(scan.scan_date)}</p>
                    
                    ${topDisease ? `
                        <div class="disease-preview">
                            <span class="disease-name">${topDisease.name}</span>
                            <span class="disease-prob">${Math.round(topDisease.probability * 100)}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="scan-actions">
                    <button class="btn-icon" onclick="scanHistory.viewDetails('${scan.id}')" title="View Details">
                        👁️
                    </button>
                    <button class="btn-icon" onclick="scanHistory.toggleFavorite('${scan.id}')" title="Toggle Favorite">
                        ${scan.is_favorite ? '⭐' : '☆'}
                    </button>
                    <button class="btn-icon" onclick="scanHistory.deleteScan('${scan.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    async updateStats() {
        const stats = await this.getStats();
        
        document.getElementById('total-scans')?.textContent = stats.total;
        document.getElementById('healthy-count')?.textContent = stats.healthy;
        document.getElementById('diseased-count')?.textContent = stats.diseased;
        document.getElementById('unique-plants')?.textContent = stats.uniquePlants;
    }

    async getStats() {
        const { data } = await this.supabase
            .from('scans')
            .select('is_healthy, plant_name')
            .eq('user_id', this.auth.currentUser.id);

        if (!data) return { total: 0, healthy: 0, diseased: 0, uniquePlants: 0 };

        const uniquePlants = new Set(data.map(s => s.plant_name)).size;

        return {
            total: data.length,
            healthy: data.filter(s => s.is_healthy).length,
            diseased: data.filter(s => !s.is_healthy).length,
            uniquePlants
        };
    }

    async viewDetails(scanId) {
        window.location.href = `results.html?id=${scanId}`;
    }

    async toggleFavorite(scanId) {
        const scan = this.scans.find(s => s.id === scanId);
        if (!scan) return;

        const { error } = await this.supabase
            .from('scans')
            .update({ is_favorite: !scan.is_favorite })
            .eq('id', scanId);

        if (!error) {
            scan.is_favorite = !scan.is_favorite;
            this.renderScans();
        }
    }

    async deleteScan(scanId) {
        if (!confirm('Are you sure you want to delete this scan?')) return;

        const scan = this.scans.find(s => s.id === scanId);
        
        // Delete from storage
        if (scan?.image_path) {
            await this.supabase.storage
                .from('plant-images')
                .remove([scan.image_path]);
        }

        // Delete from database
        const { error } = await this.supabase
            .from('scans')
            .delete()
            .eq('id', scanId);

        if (!error) {
            this.scans = this.scans.filter(s => s.id !== scanId);
            this.renderScans();
            this.updateStats();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.scanHistory = new ScanHistory();
});