import { Link, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

// Mock meeting data (would come from API in real app)
const meetingData = {
    id: '1',
    type: 'video',
    title: 'Immigration Law Consultation',
    professional: {
        name: 'Sarah Jenkins, Esq.',
        title: 'Immigration Attorney',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    },
    date: 'October 24, 2024',
    time: '10:00 AM - 11:00 AM',
    timezone: 'EST',
    platform: 'Zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    confirmationNumber: 'APT-2024-1024-001',
}

export default function MeetingConfirmationPage() {
    const { id } = useParams()
    const meeting = meetingData // In real app, fetch based on id

    const handleAddToCalendar = (type) => {
        // In real app, generate calendar file or link
        console.log(`Adding to ${type} calendar`)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <div className="w-full max-w-lg">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-25" />
                        <div className="relative w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                                check_circle
                            </span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Booking Confirmed!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Your appointment has been successfully scheduled.
                    </p>
                </div>

                {/* Meeting Details Card */}
                <Card className="mb-6">
                    <div className="flex flex-col gap-6 p-2">
                        {/* Professional Info */}
                        <div className="flex items-center gap-4">
                            <Avatar src={meeting.professional.avatar} alt={meeting.professional.name} size="lg" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {meeting.professional.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {meeting.professional.title}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-4">
                            {/* Meeting Title */}
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">event</span>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{meeting.title}</p>
                                    <p className="text-sm text-slate-500">{meeting.type === 'video' ? 'Video Call' : 'Phone Call'}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{meeting.date}</p>
                                    <p className="text-sm text-slate-500">{meeting.time} ({meeting.timezone})</p>
                                </div>
                            </div>

                            {/* Platform */}
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">videocam</span>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{meeting.platform}</p>
                                    <p className="text-sm text-slate-500">Meeting link will be sent via email</p>
                                </div>
                            </div>

                            {/* Confirmation Number */}
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                                <div>
                                    <p className="text-sm text-slate-500">Confirmation Number</p>
                                    <p className="font-mono font-bold text-slate-900 dark:text-white">{meeting.confirmationNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Add to Calendar */}
                <Card className="mb-6">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Add to Calendar</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleAddToCalendar('google')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Google</span>
                            </button>
                            <button
                                onClick={() => handleAddToCalendar('outlook')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-blue-600">calendar_month</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Outlook</span>
                            </button>
                            <button
                                onClick={() => handleAddToCalendar('ical')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-600">download</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">iCal</span>
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/client/appointments" className="flex-1">
                        <Button className="w-full" icon="calendar_month">View All Appointments</Button>
                    </Link>
                    <Link to="/client" className="flex-1">
                        <Button variant="outline" className="w-full" icon="home">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Need to reschedule?{' '}
                    <Link to="/client/appointments" className="text-primary hover:underline">
                        Manage your appointments
                    </Link>
                </p>
            </div>
        </div>
    )
}
