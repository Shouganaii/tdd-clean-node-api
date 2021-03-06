import { SignUpController } from './signup'
import { MissingParamError, ServerError, InvalidParamError } from '../../errors'
import { AccountModel, EmailValidator, AddAccountModel, AddAccount } from './signup-protocols'

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
    addAccountStub: AddAccount
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}
const makeAddAcount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        add(account: AddAccountModel): AccountModel {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email',
                password: 'valid_password'
            }
            return fakeAccount
        }
    }
    return new AddAccountStub()
}

const makeEmailValidatorWithError = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            throw new Error()
        }
    }
    return new EmailValidatorStub()
}
const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator()
    const addAccountStub = makeAddAcount()
    const sut = new SignUpController(emailValidatorStub, addAccountStub)
    return {
        sut,
        emailValidatorStub,
        addAccountStub
    }
}
describe('signUp Controller', () => {
    test('Should return 400 if no name is provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    })
    test('Should return 400 if no email is provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                name: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })
    test('Should return 400 if no password is provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
    test('Should return 400 if no password confirmation is provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
    })
    test('Should return 400 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpResquest = {
            body: {
                email: 'invalid_email@mail.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })
    test('Should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
        const httpResquest = {
            body: {
                email: 'invalid_email@mail.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        sut.handle(httpResquest)
        expect(isValidSpy).toHaveBeenCalledWith('invalid_email@mail.com')
    })
    test('Should return 500 if AddAcckh t throws', () => {
        const { sut, addAccountStub } = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
            throw new Error()
        })
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if EmailValidator throws', () => {
        const emailValidatorStub = makeEmailValidatorWithError()
        const sut = new SignUpController(emailValidatorStub, makeAddAcount())
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should call AddAcount with correct values', () => {
        const { sut, addAccountStub } = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')
        const httpResquest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        sut.handle(httpResquest)
        expect(addSpy).toHaveBeenCalledWith({
            email: 'any_email@mail.com',
            name: 'any_name',
            password: 'any_password'
        })
    })
})
