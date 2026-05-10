import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FTUEContext = createContext(null)

const STORAGE_KEY = 'immi_ftue_completed'
const TOTAL_STEPS = 4

export function FTUEProvider({ children }) {
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [hasCompletedTour, setHasCompletedTour] = useState(false)

    // Check localStorage on mount
    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY)
        if (completed === 'true') {
            setHasCompletedTour(true)
        }
    }, [])

    const startTour = useCallback(() => {
        setCurrentStep(1)
        setIsActive(true)
    }, [])

    const nextStep = useCallback(() => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1)
        } else {
            finishTour()
        }
    }, [currentStep])

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }, [currentStep])

    const skipTour = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setHasCompletedTour(true)
        setIsActive(false)
    }, [])

    const finishTour = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setHasCompletedTour(true)
        setIsActive(false)
    }, [])

    const resetTour = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setHasCompletedTour(false)
        setCurrentStep(1)
    }, [])

    const value = {
        isActive,
        currentStep,
        totalSteps: TOTAL_STEPS,
        hasCompletedTour,
        startTour,
        nextStep,
        previousStep,
        skipTour,
        finishTour,
        resetTour,
    }

    return (
        <FTUEContext.Provider value={value}>
            {children}
        </FTUEContext.Provider>
    )
}

export function useFTUE() {
    const context = useContext(FTUEContext)
    if (!context) {
        throw new Error('useFTUE must be used within a FTUEProvider')
    }
    return context
}

export default FTUEProvider
