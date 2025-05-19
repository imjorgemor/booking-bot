// CONFIGURATION
//remember if bookings are at 23 utc, cron must start at 22:58 💾
// 58 21 summer time // 58 22 winter time
export const DAY_DEFINITIONS = {
    SUNDAY: '59 21 * * 3', //sunday 23.59 => jueves
    MONDAY: '59 21 * * 4', //monday 23.59 => viernes
    TUESDAY: '59 21 * * 5', // tuesday 23.59 => sabado
    WEDNESDAY: '59 21 * * 6', // wednesday 23.59 => domingo
    THURSDAY: '59 21 * * 0', // thursday 23.59 => lunes
    FRIDAY: '59 21 * * 1', // friday 23.59 => martes
    SATURDAY: '59 21 * * 2' // saturday 23.59 => miercoles
}