
export interface RSVPData {
  name: string;
  email: string;
  attending: 'yes' | 'no';
  guests: number;
  message: string;
}

export interface Blessing {
  text: string;
}

export interface GuestMessage {
  id: string;
  name: string;
  message: string;
  date: string;
}

export interface CountdownProps {
  targetDate: string;
}

export interface RSVPFormProps {
  deadline: string;
}
