import googleCalendar from '@googleapis/calendar';

class CalendarService {
  constructor() {
    this.SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
    this.SCOPE_EVENTS = 'https://www.googleapis.com/auth/calendar.events';
    this.GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCq7Vk9QQosGRCr\nmvR+UYYsTIeZabTHCgLU5y8E7LfWWs61XEyDXd/g99vT/JgudYwBekDRenkz6DB0\nlnY8DEVpqDtAO2DTybNNDGnSJMgvspMpD6Jgs7/lIYWN1iEo2vci4Xcl/PHNLxJ0\ntQXVIIzTk/LS06goQ//Oq3xQBXYZsgLRl7zhH9GF/OrokznNJHxl78ca/aY0ZSAC\nmgHMJpMECQXc73/qoJzi1BOascwQH+Sot1P+0WKDU2JG9TlWgrydhKoLaXLEAiX0\n5LX/DcDTS+Ap8tvdyf7ktFYpWgguiC8SmV2ZvJzvvZPq+UbaUPmzudlT+Nng9NpR\n6RktsxnnAgMBAAECggEAQkPtHmW6K1l2UIks81HoygDLaysDdkzHx0FvRaH+LYCb\n9cy4Lw+0TVPaKieZ2h0hL6t1OKEaHwkLzA9O/D2npWweuGqswb7HH/5JgjpXT8KT\n8c3JXmMhaJPj4paa2Wt2d1PgrN4Q4kK3DX7mqXdKkXYgpCKBZUbjg/yQn7dWT2RF\nJKkkO4RawdSEjIww5WkICVwtjSYo/ema7ZKUwElcSxoNwKcArZ8Ekx0B3zaiFDFL\nCENIKCVs4kpwvh2W7VHCbtKSnrabWiDgLASDK2MyA7UWlZoy3+Ty65AM8FZzKH11\n015Ywi8RvSEsOLcm3HElTtWU8AtmEv3SNXlIbYF4HQKBgQDUEZZenDHE2w2BHdsB\nbFWXNcZ4ITdzAwCFN0J1bW+3hOGvegryLwKPtCvgxKJVX/2VsAV4xOw3CK6lDh1a\nwhgiyc4gxG7dBXtn7mL+zNVYp0+TkenEP+ST3slsi6eyfCjfuTIwqd/TqeCWgNSc\ndEvuigr9M6G5SNlLvIrsRJMIlQKBgQDOVfHpwGMpkXSzpDuZRAR1ZMEzmLZVkhqv\nd83BAdHUVUzr6Jh6cQtv4169yfBv+WqVsApP8xeLF0NSP0DMTFZpW1FSGsJSOq14\ncsOPEL62e00J1HeUCp2N9fFbIr+LS5+dh2CDoOfLdl5uAeP7xPqKyabsJosq3hW7\nLQNkzt5tiwKBgCXTxUi2/8GneS8wziHg2xuPwgknk6Z2QJ+Cjd44WRcZItCUKmOs\nsv5DGxiKupIT/z22GiPCrIfcippyfBX2TSvXZ2c84rGWCr8tLIdariuUHIOsIVCa\nPQGLWc580rrpnrjZZfR8OKqewKrX7BTEQc8Y3IDxtsVAE1KJHRar3LZJAoGBAMkq\ng9OJLWS+mo/2I+EWrl4h4DdEwSgGbRv76s8szf19OKSbveVKR4NLovfYZSFWg3Lz\nEerGr4J9KLaMUsmb93d6f3tT+XagHLZc9YqLIdTZu89EpVzhSKC6UxiudR8CmNjF\nvvQ2MSdt/Ty1fSfe8QHU/ngoT/B4W6mEhlWHVtZnAoGBAJxt0dF/kfyBpn8upLbG\nnp1t9v7+LTIjGF2vxmgawYNEy3U6VpWAcyC9+uVwx9D44jPeUWMC76qr2QVcDxbf\npiDGCerPzkU4OnmwPHv89E6BCkTCbena37KB9pOzLqcedA1b9kmw1p4ym6Q5j4cv\nDZyPX+/nLxam8VXpFGPGeUUJ\n-----END PRIVATE KEY-----\n"
    this.auth = null;
    // setTimeout(
    //   () =>
    //     this.authenticate()
    //       .then(res => (this.auth = res))
    //       .catch(e => console.log(e)),
    //   2000
    // );
    this.authenticate()
      .then(res => (this.auth = res))
      .catch(e => console.log(e));
    this.calendar = googleCalendar.calendar('v3');
  }

  async authenticate() {
    try {
      const jwtClient = new googleCalendar.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        this.GOOGLE_PRIVATE_KEY,
        [this.SCOPE_CALENDAR, this.SCOPE_EVENTS]
      );
      console.log(
        'authenticate',
        process.env.GOOGLE_CLIENT_EMAIL,
        this.SCOPE_CALENDAR,
        this.SCOPE_EVENTS,
        jwtClient
      );
      await jwtClient.authorize();
      return jwtClient;
    } catch (e) {
      console.log(e);
    }
  }

  async create(event, calendarId) {
    try {
      const answer = await calendar.events.insert({
        auth: this.auth,
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
        auth: this.auth,
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
