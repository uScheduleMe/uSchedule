import { UserProfileEmails, UserProfileProviders, UserProfileSchema } from '@services/User/types';

export class User {
  /**
   * The User's unique id
   */
  public uuid: string;

  /**
   * The User's given name
   */
  public given_name: string;

  /**
   * The User's family name
   */
  public family_name: string;

  /**
   * All the User's email addresses
   */
  public emails: UserProfileEmails;

  /**
   * All the User's providers
   */
  public providers: UserProfileProviders;

  constructor(data: UserProfileSchema) {
    this.uuid = data.uuid;
    this.given_name = data.given_name ?? '';
    this.family_name = data.family_name ?? '';
    this.emails = data.emails;
    this.providers = data.providers;
  }

  /**
   * The User's initial (first letter of their given name or email address)
   */
  public get initial(): string {
    if (this.given_name) {
      return this.given_name.substr(0, 1).toUpperCase();
    }
    return this.email.substr(0, 1).toUpperCase();
  }

  /**
   * The string to be displayed for identifying the user
   */
  public get display_name(): string {
    if (this.given_name) {
      return `${this.given_name} ${this.family_name}`;
    }
    return this.email;
  }

  /**
   * The User's primary email address
   */
  public get email(): string {
    return this.emails[0].email_address;
  }

  public clone(): User {
    return new User({
      uuid: this.uuid,
      given_name: this.given_name,
      family_name: this.family_name,
      emails: this.emails.map((o) => ({ ...o })),
      providers: this.providers && this.providers.map((o) => ({ ...o })),
    });
  }

  /* eslint-disable @typescript-eslint/no-magic-numbers */
  public getColourNum(): number {
    if (this.initial.match(/[A-D]/)) {
      return 1;
    }
    if (this.initial.match(/[E-H]/)) {
      return 2;
    }
    if (this.initial.match(/[I-L]/)) {
      return 3;
    }
    if (this.initial.match(/[M-P]/)) {
      return 4;
    }
    if (this.initial.match(/[Q-T]/)) {
      return 5;
    }
    return 6;
  }

  /**
   * Used to sort User objects by comparing their display names
   * @param a a User
   * @param b a User
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByDisplayName(a: User, b: User): number {
    return a.display_name.localeCompare(b.display_name);
  }
}
