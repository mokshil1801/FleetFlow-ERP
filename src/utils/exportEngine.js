import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// FleetFlow Theme Normalization Map (High-compatibility fallbacks for oklch)
const THEME_FALLBACKS = {
    'oklch(0.208 0.042 265.755)': '#0f172a', // slate-900 (Dashboard Header)
    'oklch(0.511 0.262 276.966)': '#6366f1', // indigo-500
    'oklch(0.627 0.265 303.891)': '#a855f7', // purple-500
    'oklch(0.614 0.204 257.417)': '#3b82f6', // blue-500
    'oklch(0.648 0.2 160.335)': '#10b981', // emerald-500
    'oklch(0.541 0.225 12.606)': '#f43f5e', // rose-500
    'oklch(0.769 0.188 70.08)': '#f59e0b', // amber-500 (Maintenance labels)
};

export const generateDashboardPDF = async (elementId, filename = 'FleetFlow-Executive-Report.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) return { success: false, error: 'Target element not found' };

    try {
        // Wait for animations to finish
        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (!clonedElement) return;

                // Deep Normalization: Bypass html2canvas color parser by forcing inline HEX
                const allElements = clonedElement.querySelectorAll('*');
                allElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
                        const val = style[prop];
                        if (val && val.includes('oklch')) {
                            // Find matching theme fallback or use generic
                            const fallback = Object.entries(THEME_FALLBACKS).find(([oklch]) => val.includes(oklch))?.[1] ||
                                (prop === 'color' ? '#1e293b' : 'transparent');
                            el.style.setProperty(prop, fallback, 'important');
                        }
                    });

                    // Remove transition classes that confuse the renderer
                    el.style.transition = 'none';
                    el.style.animation = 'none';
                    el.style.transform = 'none';
                });

                // Clear problematic blurs
                clonedElement.querySelectorAll('svg.blur-\\[120px\\], .animate-pulse').forEach(el => el.remove());
            }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
        return { success: true };
    } catch (error) {
        console.error('PDF Export Error:', error);
        return { success: false, error: error.message };
    }
};

// Premium Educational Structured Export Engine
export const generateStructuredPDF = async (data, filename = 'FleetFlow-Intelligence-Brief.pdf') => {
    try {
        const { kpis, alerts, analytics, insights } = data;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 1. Executive Branding Header
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, pageWidth, 30, 'F');

        // Add a subtle accent line
        pdf.setFillColor(59, 130, 246); // blue-500
        pdf.rect(0, 30, pageWidth, 1.5, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FLEETFLOW EXECUTIVE BRIEF', 12, 18);

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text('STRATEGIC OVERSIGHT & OPERATIONAL INTELLIGENCE', 12, 25);

        pdf.setTextColor(255, 255, 255);
        pdf.text(`REPORT ID: FF-${Date.now().toString().slice(-6)}`, pageWidth - 50, 14);
        pdf.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 50, 19);

        let y = 45;

        // 2. Simple Guide Section
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.roundedRect(10, y, pageWidth - 20, 15, 2, 2, 'F');
        pdf.setTextColor(71, 85, 105); // slate-600
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('How to read this report: This document summarizes your fleet\'s health, spending, and safety. ', 15, y + 6);
        pdf.text('Items in "Priority Alerts" require your immediate attention to prevent future costs.', 15, y + 10);
        y += 25;

        // 3. Strategic KPIs (Simple Dashboard)
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('1. CORE FLEET HEALTH', 10, y);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text('A quick look at how many vehicles are working and how well they are being used.', 10, y + 5);
        y += 15;

        const kpiItems = [
            { label: 'Vehicles Working', value: kpis.activeFleet, desc: 'Units on missions' },
            { label: 'Need Service', value: kpis.maintenanceAlerts, desc: 'Repair required' },
            { label: 'Usage Score', value: `${kpis.utilizationRate}%`, desc: 'Overall activity' },
            { label: 'Waitlist', value: kpis.pendingCargo, desc: 'Upcoming jobs' }
        ];

        kpiItems.forEach((item, i) => {
            const x = 10 + (i * 48);
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(x, y - 5, 42, 20, 2, 2, 'FD');

            pdf.setTextColor(59, 130, 246);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(String(item.value), x + 4, y + 3);

            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(8);
            pdf.text(item.label, x + 4, y + 8);

            pdf.setTextColor(148, 163, 184);
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            pdf.text(item.desc, x + 4, y + 12);
        });

        y += 30;

        // 4. Strategic Insights (Simple Terms)
        if (insights && insights.length > 0) {
            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('2. EXPERT INSIGHTS', 10, y);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 116, 139);
            pdf.text('Smart observations derived from your fleet data to help you save time and money.', 10, y + 5);
            y += 12;

            insights.forEach((insight, i) => {
                pdf.setFillColor(241, 245, 249); // slate-100
                pdf.roundedRect(10, y - 4, pageWidth - 20, 12, 1, 1, 'F');

                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(59, 130, 246);
                pdf.setFontSize(8);
                pdf.text(insight.category.toUpperCase(), 15, y + 3);

                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                pdf.text(insight.text, 50, y + 3);
                y += 14;
            });
            y += 5;
        }

        // 5. Money & Spending (Simplified Financials)
        if (analytics) {
            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('3. SPENDING SUMMARY', 10, y);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 116, 139);
            pdf.text('A clear breakdown of your operational costs and fuel efficiency.', 10, y + 5);
            y += 12;

            const financialData = [
                ['Category', 'Current Total', 'Simple Explanation'],
                ['Fuel Spend', `$${analytics.total_fuel_cost?.toLocaleString() || '0'}`, 'Money spent to keep the fleet moving.'],
                ['Repairs Spend', `$${analytics.total_maintenance_cost?.toLocaleString() || '0'}`, 'Cost of fixing and servicing vehicles.'],
                ['Fuel Efficiency', `${analytics.avg_fuel_efficiency || '0'} km/L`, 'How many KM you get per Liter of fuel.']
            ];

            pdf.setFontSize(9);
            financialData.forEach((row, i) => {
                if (i === 0) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(10, y - 4, pageWidth - 20, 7, 'F');
                    pdf.setFont('helvetica', 'bold');
                } else {
                    pdf.setFont('helvetica', 'normal');
                }
                pdf.text(row[0], 15, y + (i * 8));
                pdf.text(row[1], 55, y + (i * 8));
                pdf.setFontSize(7);
                pdf.setTextColor(148, 163, 184);
                pdf.text(row[2], 90, y + (i * 8));
                pdf.setTextColor(15, 23, 42);
                pdf.setFontSize(9);

                if (i > 0) {
                    pdf.setDrawColor(241, 245, 249);
                    pdf.line(10, y + (i * 8) + 2, pageWidth - 10, y + (i * 8) + 2);
                }
            });
            y += (financialData.length * 8) + 12;
        }

        // 6. Action Items (Simplified Alerts)
        if (alerts && alerts.length > 0) {
            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('4. ACTION ITEMS (ALERTS)', 10, y);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 116, 139);
            pdf.text('These vehicles need service soon to avoid expensive breakdowns.', 10, y + 5);
            y += 12;

            pdf.setFillColor(254, 242, 242); // rose-50
            pdf.rect(10, y - 5, pageWidth - 20, 8, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(225, 29, 72); // rose-600
            pdf.text('VEHICLE NAME', 15, y);
            pdf.text('REMAINING DISTANCE', 80, y);
            pdf.text('RECOMMENDATION', 130, y);
            y += 8;

            alerts.forEach((alert, i) => {
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.text(alert.name, 15, y);
                pdf.text(`${alert.next_service_odometer - alert.odometer} KM`, 80, y);
                pdf.setTextColor(100, 116, 139);
                pdf.text('Schedule maintenance soon.', 130, y);

                pdf.setDrawColor(241, 245, 249);
                pdf.line(10, y + 2, pageWidth - 10, y + 2);
                y += 8;
            });
        }

        // Professional Footer
        pdf.setDrawColor(226, 232, 240);
        pdf.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text('FLEETFLOW INTELLIGENCE BRIEF - CONFIDENTIAL', 10, pageHeight - 15);
        pdf.text('Empowering smarter fleet decisions through data.', pageWidth / 2, pageHeight - 15, { align: 'center' });
        pdf.text(`PAGE 01 OF 01`, pageWidth - 30, pageHeight - 15);

        pdf.save(filename);
        return { success: true };
    } catch (error) {
        console.error('Educational PDF Export Error:', error);
        return { success: false, error: error.message };
    }
};
