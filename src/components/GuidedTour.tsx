'use client'

import { useEffect, useRef } from 'react'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function GuidedTour() {
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return

    const tourSeen = localStorage.getItem('nitos_tour_seen')
    if (tourSeen) return

    hasRun.current = true

    const timer = setTimeout(() => {
      const steps: DriveStep[] = [
        {
          element: '#categorias-step',
          popover: {
            title: '🍕 Explora el Menú',
            description:
              'Desliza y presiona aquí para moverte rápido entre nuestras distintas secciones.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#carrito-step',
          popover: {
            title: '💰 Tu Cuenta en Vivo',
            description:
              'Conforme agregues o quites productos o ingredientes, los precios se sumarán y restarán en automático aquí en tiempo real.',
            side: 'top',
            align: 'end',
          },
        },
        {
          element: '#carrito-step',
          popover: {
            title: '🛵 Elige tu Entrega',
            description:
              'Al avanzar, podrás ingresar tus datos para recibir tu pedido A Domicilio o seleccionar Pasar a Recoger en el establecimiento. ¡Tu orden se estructurará de inmediato para ser enviada a nuestro WhatsApp!',
            side: 'top',
            align: 'end',
          },
        },
      ]

      const driverObj = driver({
        steps,
        showProgress: false,
        animate: true,
        overlayClickNext: false,
        overlayOpacity: 0.7,
        stagePadding: 8,
        stageRadius: 8,
        popoverClass: 'nitos-tour-popover',
        nextBtnText: 'Siguiente',
        prevBtnText: '',
        doneBtnText: 'Finalizar',
        showButtons: ['next', 'previous', 'close', 'done'],
        onHighlightStarted: () => {
          // hide prev button on first step
        },
        onDestroyed: () => {
          localStorage.setItem('nitos_tour_seen', 'true')
        },
      })

      driverObj.drive()
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <style>{`
      .nitos-tour-popover.driver-popover {
        --driver-popover-bg-color: #1a1a1a;
        --driver-popover-border-color: rgba(245, 158, 11, 0.3);
        --driver-popover-title-color: #fbbf24;
        --driver-popover-desc-color: #d1d5db;
        --driver-popover-next-bg-color: #f59e0b;
        --driver-popover-next-text-color: #000;
        --driver-popover-prev-bg-color: rgba(255,255,255,0.05);
        --driver-popover-prev-text-color: #9ca3af;
        background: #1a1a1a !important;
        border: 1px solid rgba(245, 158, 11, 0.3) !important;
        border-radius: 12px !important;
        color: #e5e7eb !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(245, 158, 11, 0.1) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      .nitos-tour-popover .driver-popover-title {
        color: #fbbf24 !important;
        font-weight: 800 !important;
        font-size: 15px !important;
        line-height: 1.3 !important;
      }
      .nitos-tour-popover .driver-popover-description {
        color: #d1d5db !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
      }
      .nitos-tour-popover .driver-popover-next-btn {
        background: #f59e0b !important;
        color: #000 !important;
        border-radius: 8px !important;
        font-weight: 700 !important;
        font-size: 13px !important;
        padding: 6px 16px !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .nitos-tour-popover .driver-popover-next-btn:hover {
        background: #d97706 !important;
      }
      .nitos-tour-popover .driver-popover-prev-btn {
        display: none !important;
      }
      .nitos-tour-popover .driver-popover-close-btn {
        color: #6b7280 !important;
        font-size: 22px !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .nitos-tour-popover .driver-popover-close-btn:hover {
        color: #f59e0b !important;
      }
      .nitos-tour-popover .driver-popover-arrow {
        border: 8px solid transparent !important;
      }
      .nitos-tour-popover .driver-popover-arrow-side-left {
        border-right-color: #1a1a1a !important;
      }
      .nitos-tour-popover .driver-popover-arrow-side-right {
        border-left-color: #1a1a1a !important;
      }
      .nitos-tour-popover .driver-popover-arrow-side-top {
        border-bottom-color: #1a1a1a !important;
      }
      .nitos-tour-popover .driver-popover-arrow-side-bottom {
        border-top-color: #1a1a1a !important;
      }
      .nitos-tour-popover.driver-popover.progress-bar .driver-popover-progress-text {
        color: #9ca3af !important;
      }
    `}</style>
  )
}
