/**
 * Validators namespace
 */
namespace Validation {
  interface Validatable {
    value: string | number;
    isRequired?: boolean;
  }
  
  export interface ValidatableString extends Validatable {
    value: string;
    minLength?: number;
    maxLength?: number;
  }
  
  export interface ValidatableNumber extends Validatable {
    value: number;
    min?: number;
    max?: number;
  }
  
  function isValidatableString(field: Validatable): field is ValidatableString { // custom typeguard function return type, for TS error checking
    // type guard; it's an instanceof for an interface... in spirit
    return (typeof field.value === 'string');
  }
  
  export function validate(field: ValidatableString | ValidatableNumber): boolean {
    let isValidTotal = true;
    if (field.isRequired) isValidTotal = isValidTotal && (field.value.toString().trim().length !== 0);
    if (isValidatableString(field)) { // checks for strings
      if (field.minLength != null) isValidTotal = isValidTotal && (field.value.trim().length >= field.minLength);
      if (field.maxLength != null) isValidTotal = isValidTotal && (field.value.trim().length <= field.maxLength);  
    } else { // checks for numbers
      if (field.min != null) isValidTotal = isValidTotal && (+field.value >= field.min);
      if (field.max != null) isValidTotal = isValidTotal && (+field.value <= field.max);
    }
    return isValidTotal;
  }
}