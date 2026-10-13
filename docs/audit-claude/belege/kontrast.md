# 1) Doc-Tabelle: 60 Zeilen geparst

| Modus | Vordergrund | Hintergrund | Doc | berechnet | Δ | Token-Hex = CSS? |
|---|---|---|---|---|---|---|
| Dark | status-error-solid #EF4444 | on-status-error-solid #0B111E | 5.01 | 5.01 | +0.00 | NEIN (CSS: #EF4444 / #FFFFFF) |

Abweichung > 0,05: 0 von 60; Hex im Doc ≠ CSS: 1

# 2) Tokenpaare mit Kontrast unter Soll

| Modus | Text | Hintergrund | Kontrast | Soll 4,5 |
|---|---|---|---|---|
| Light | text-muted #64748B | app-bg #F3F4F6 | 4.32 | unter 4,5 |
| Light | text-muted #64748B | surface-elevated #E9EDF2 | 4.05 | unter 4,5 |
| Light | text-muted #64748B | surface-sunken #DEE3E9 | 3.69 | unter 4,5 |
| Light | text-muted #64748B | status-error-bg #FEF2F2 | 4.35 | unter 4,5 |
| Light | text-muted #64748B | status-trunk-bg #EEF2FF | 4.26 | unter 4,5 |
| Light | text-muted #64748B | status-blocking-bg #FFF7ED | 4.48 | unter 4,5 |
| Light | status-success-fg #047857 | surface-sunken #DEE3E9 | 4.25 | unter 4,5 |
| Light | status-blocking-fg #C2410C | surface-elevated #E9EDF2 | 4.40 | unter 4,5 |
| Light | status-blocking-fg #C2410C | surface-sunken #DEE3E9 | 4.01 | unter 4,5 |
| Light | terminal-muted #94A3B8 | app-bg #F3F4F6 | 2.33 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | surface #FFFFFF | 2.56 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | surface-elevated #E9EDF2 | 2.18 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | surface-sunken #DEE3E9 | 1.99 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | status-success-bg #ECFDF5 | 2.43 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | status-warning-bg #FFFBEB | 2.47 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | status-error-bg #FEF2F2 | 2.34 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | status-trunk-bg #EEF2FF | 2.29 | UNTER 3,0 |
| Light | terminal-muted #94A3B8 | status-blocking-bg #FFF7ED | 2.41 | UNTER 3,0 |

# 3) on-*-solid auf *-solid (Buttons/Badges, Soll 4,5)

| Modus | Paar | Kontrast |
|---|---|---|
| Light | on-accent-solid #FFFFFF auf #1D4ED8 | 6.70 |
| Light | on-status-success-solid #FFFFFF auf #059669 | 3.77  ← UNTER 4,5 |
| Light | on-status-warning-solid #FFFFFF auf #D97706 | 3.19  ← UNTER 4,5 |
| Light | on-status-error-solid #FFFFFF auf #DC2626 | 4.83 |
| Light | on-status-trunk-solid #FFFFFF auf #4F46E5 | 6.29 |
| Light | on-status-blocking-solid #FFFFFF auf #EA580C | 3.56  ← UNTER 4,5 |
| Light | primary-foreground #FFFFFF auf primary #2563EB | 5.17 |
| Light | destructive-foreground auf destructive #DC2626 | 4.83 |
| Dark | on-accent-solid #0B111E auf #3B82F6 | 5.13 |
| Dark | on-status-success-solid #0B111E auf #34D399 | 9.81 |
| Dark | on-status-warning-solid #0B111E auf #FBBF24 | 11.30 |
| Dark | on-status-error-solid #FFFFFF auf #EF4444 | 3.76  ← UNTER 4,5 |
| Dark | on-status-trunk-solid #0B111E auf #818CF8 | 6.32 |
| Dark | on-status-blocking-solid #0B111E auf #FB923C | 8.34 |
| Dark | primary-foreground #0B111E auf primary #60A5FA | 7.42 |
| Dark | destructive-foreground auf destructive #DC2626 | 4.83 |
