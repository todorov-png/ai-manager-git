import googleCalendar from '@googleapis/calendar';

const SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
const SCOPE_EVENTS = 'https://www.googleapis.com/auth/calendar.events';
const auth = await authenticate();
const calendar = googleCalendar.calendar('v3');

async function authenticate() {
  const jwtClient = new googleCalendar.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY,
    [SCOPE_CALENDAR, SCOPE_EVENTS]
  );
  await jwtClient.authorize();
  return jwtClient;
}

class CalendarService {
  async create(event, calendarId) {
    try {
      const answer = await calendar.events.insert({
        auth: auth,
        calendarId,
        resource: event,
      });
      return answer.data.id;
    } catch {
      return '';
    }
  }

  async update(event, calendarId, id) {
    try {
      const answer = await calendar.events.update({
        auth,
        calendarId,
        eventId: id,
        resource: event,
      });
      return answer.data.id;
    } catch {
      return '';
    }
  }

  async createOrUpdate(event, calendarId, id = '') {
    if (!calendarId) return '';
    if (id) {
      return await this.update(event, calendarId, id);
    } else {
      return await this.create(event, calendarId);
    }
  }
}

export default new CalendarService();
