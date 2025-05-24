const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    itConsultingId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultingEvent', required: true },
    specialistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    appointmentDateTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    notes: { type: String, default: '' },
    bookingId: { type: String, unique: true, required: true },
    paymentStatus: { type: String, enum: ['due', 'paid', 'na'], default: 'na' },
    pricePaid: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
    state: {
        type: String,
        enum: ['booked', 'rescheduled', 'cancelled', 'completed_auto', 'completed_manual'],
        default: 'booked'
    },
}, { timestamps: true });

appointmentSchema.virtual('endTime').get(function() {
    if (this.appointmentDateTime && this.durationMinutes) {
        const endDate = new Date(this.appointmentDateTime.getTime() + this.durationMinutes * 60000);
        return endDate;
    }
    return null;
});

appointmentSchema.set('toObject', { virtuals: true });
appointmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);