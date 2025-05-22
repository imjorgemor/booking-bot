// CONFIGURATION
//remember if bookings are at 23 utc, cron must start at 22:58 💾
// 58 21 summer time // 58 22 winter time
export const DAY_DEFINITIONS = {
    SUNDAY: '59 21 * * 3', //sunday 23.59 => miercoles 23.59
    MONDAY: '59 21 * * 4', //monday 23.59 => jueves 23.59
    TUESDAY: '59 21 * * 5', // tuesday 23.59 => viernes 23.59
    WEDNESDAY: '59 21 * * 6', // wednesday 23.59 => sabado 23.59
    THURSDAY: '59 21 * * 0', // thursday 23.59 => domingo 23.59
    FRIDAY: '59 21 * * 1', // friday 23.59 => lunes 23.59
    SATURDAY: '59 21 * * 2' // saturday 23.59 => martes 23.59
}