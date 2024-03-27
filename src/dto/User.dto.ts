import { IsEmail, IsEmpty, Length } from "class-validator";

export class CreateUserInputs {
  @IsEmail()
  email: string;

  @Length(7, 18)
  phone: string;

  @Length(6, 12)
  password: string;
}

export class UserLoginInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

export class EditUserProfileInputs {
  @Length(6, 32)
  firstName: string;

  @Length(3, 32)
  LastName: string;

  @Length(6, 32)
  address: string;
}

export interface UserPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class OrderInputs{
  _id :string;
  unit :number;
}
