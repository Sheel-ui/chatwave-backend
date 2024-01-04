import { JoiReqestValidationError } from '@global/helpers/errorHandler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
        // Saving the original method from the descriptor
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const req: Request = args[0];

            // Validating the request body against the provided Joi schema
            const { error } = await Promise.resolve(schema.validate(req.body));
            if (error?.details) {
                throw new JoiReqestValidationError(error.details[0].message);
            }

            // Invoking the original method with the arguments
            return originalMethod.apply(this, args);
        };

        // Returning the modified descriptor
        return descriptor;
    };
}
