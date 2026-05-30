# 📡 Cálculo I — La Derivada en Acción
### Simulador de Auto-scaling de Servidores

> **Proyecto Final — Cálculo I**  
> Universidad Mariano Gálvez de Guatemala

---

## 📌 Descripción

Este proyecto aplica el concepto de **derivada** como herramienta para la toma de decisiones en tiempo real dentro de un sistema informático de auto-scaling de servidores.

Se modela el comportamiento de usuarios conectados durante un evento en línea mediante la función polinómica:

$$U(t) = -t^3 + 9t^2 + 48t + 200$$

Y su derivada (razón de cambio instantánea):

$$U'(t) = -3t^2 + 18t + 48$$

La derivada `U'(t)` indica cuántos usuarios llegan (o salen) por hora en el instante exacto `t`, permitiendo al sistema activar o desactivar servidores de forma preventiva antes de que se produzca un colapso.

---

## 🎯 Objetivo del Proyecto

Demostrar que la derivada no es solo un concepto teórico, sino una herramienta con aplicaciones reales en ingeniería de sistemas: al conocer la **velocidad de cambio** de la carga, un sistema puede escalar su infraestructura de forma inteligente y anticipada.

---

## ⚙️ ¿Cómo funciona el simulador?

El simulador evalúa en cada instante `t` (de 0 a 10 horas) tanto `U(t)` como `U'(t)` y determina cuántos servidores deben estar activos:

| Condición | Estado | Servidores activos |
|---|---|---|
| `U'(t) < umbral` y `U(t) ≤ capacidad` | ✅ Sistema Estable | SRV-01 |
| `U'(t) ≥ umbral` (alerta preventiva) | ⚡ Alerta Preventiva | SRV-01 + SRV-02 |
| `U(t) > capacidad` | ⚡ Escalando | SRV-01 + SRV-02 |
| `U(t) > 2 × capacidad` | ⚠ Colapso Inminente | SRV-01 + SRV-02 + SRV-03 |

El usuario puede ajustar:
- **Umbral de velocidad crítica** (20 – 120 usr/hr): valor mínimo de `U'(t)` que dispara una alerta.
- **Capacidad máxima del servidor base** (200 – 800 usuarios): límite de carga antes de activar servidores adicionales.
- **Cursor de tiempo `t`**: permite avanzar manualmente o reproducir la simulación en tiempo real.

---

## 🖥️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **React 18** | Interfaz de usuario con componentes funcionales y hooks |
| **Vite** | Bundler y servidor de desarrollo |
| **Recharts** | Gráficas de área para `U(t)` y `U'(t)` |
| **CSS-in-JS** | Estilos inline con paleta de colores personalizada |

---

## 🚀 Instalación y ejecución local

### Requisitos previos
- Node.js 18 o superior
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/alberto94071/Pro_Fin_Calculo_I.git

# 2. Entrar a la carpeta del proyecto
cd Pro_Fin_Calculo_I

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173`

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
```

---

## 📁 Estructura del proyecto

```
Pro_Fin_Calculo_I/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx      # Punto de entrada de la aplicación
    └── App.jsx       # Componente principal (simulador completo)
```

---

## 📐 Fundamento matemático

### Función de usuarios U(t)

Representa el número de usuarios conectados en el tiempo `t` (en horas):

```
U(t) = -t³ + 9t² + 48t + 200
```

### Derivada U'(t) — Razón de cambio instantánea

Obtenida término a término:

```
d/dt(-t³)  = -3t²
d/dt(9t²)  = 18t
d/dt(48t)  = 48
d/dt(200)  = 0

U'(t) = -3t² + 18t + 48
```

**Interpretación:** Si `U'(3) = 75 usr/hr`, significa que exactamente a las 3 horas del evento, la plataforma recibe 75 nuevos usuarios por hora, es decir, un usuario nuevo cada 0.8 minutos.

---

## 👥 Integrantes

| # | Nombre Completo | Carné |
|---|---|---|
| 1 | Andrea Isabel Godínez Cruz | 0903-24-25969 |
| 2 | Carlos Vallardo Morales G. | 0903-25-16887 |
| 3 | Rony Alberto Méndez Fuentes | 0903-25-29637 |

---

*Universidad Mariano Gálvez de Guatemala — Cálculo I*
