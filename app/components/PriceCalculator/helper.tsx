import typeOptions from "./exam-prices.json";
import moment from "moment";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

type ServiceType = "exam" | "class" | "assignment" | "essay";

export const getOptions = (service: ServiceType) => {
  return typeOptions[service].options.map((option: any) => ({
    label: option.name,
    value: option.name,
  }));
};

export const formatDateWithTime = (date: any) => {
  if (moment.isMoment(date) && date.isValid()) {
    return date.format("MM/DD/YYYY hh:mm a");
  }
  return "";
};

export const getTomorrowDate = () => {
  return formatDateWithTime(moment(new Date()).add(1, "day"));
};

export const deadlineInHours = (momentObject: any) => {
  if (!momentObject) return;
  const currentTime = moment();
  const timeDifferenceInHours = momentObject.diff(currentTime, "hours");

  return timeDifferenceInHours;
};

export const getEmergencyPrice = (price: any, hours: any) => {
  if (hours >= 0 && hours <= 12) {
    return price + price / 2;
  } else if (hours > 12 && hours <= 24) {
    return price + price / 4;
  } else {
    return price;
  }
};

export const extractValueFromParantheses = (input: any) => {
  const regex = /\(([^)]+)\)/;
  const match = input.match(regex);
  return match ? match[1] : input;
};

export const findPolynomialLCM = (polynomial1: any, polynomial2: any) => {
  const factors1 = getFactors(polynomial1);
  const factors2 = getFactors(polynomial2);

  const commonFactors = findCommonFactors(factors1, factors2);
  const lcmPolynomial = multiplyFactors(commonFactors);

  return lcmPolynomial;
};

export const nanolitersToMicroliters = (nanoliters: any) => nanoliters * 0.001;

function getFactors(polynomial: any) {
  const factors: { [key: number]: number } = {}; // Annotate factors with type { [key: number]: number }
  const terms = polynomial.split("+");

  for (const term of terms) {
    const trimmedTerm = term.trim();
    const coefficientMatch = trimmedTerm.match(/(-?\d*\.?\d+)/);
    const exponentMatch = trimmedTerm.match(/\^(\d+)/);

    if (coefficientMatch && exponentMatch) {
      const coefficient = parseFloat(coefficientMatch[0]);
      const exponent = parseInt(exponentMatch[1]);

      factors[exponent] = coefficient;
    } else {
      const coefficient = parseFloat(trimmedTerm) || 0;
      factors[0] = coefficient;
    }
  }

  return factors;
}

function findCommonFactors(factors1: any, factors2: any) {
  const commonFactors: number[] = [];

  for (const factor in factors1) {
    if (factor in factors2) {
      commonFactors.push(parseInt(factor));
    }
  }

  return commonFactors;
}

function multiplyFactors(commonFactors: number[]) {
  let lcmPolynomial = "";

  for (const factor of commonFactors) {
    const power = factor;

    if (power === 0) {
      lcmPolynomial += `(x - 0)`;
    } else {
      lcmPolynomial += `(x - ${power})`;
    }
  }

  if (lcmPolynomial === "") {
    lcmPolynomial = "0";
  }

  return lcmPolynomial;
}
export const getCalculatorServices = (data: any) => {
  function groupBy<T>(array: T[], keyGetter: (item: T) => string) {
    const map = new Map<string, T[]>();
    array.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  const groupByServices = groupBy(data, (obj: any) => {
    return obj.serviceId.name.toLowerCase();
  });
  const services = Array.from(groupByServices.keys());

  let servicesWithOptions: any = {};
  for (let service of services) {
    servicesWithOptions[service] = {
      options: groupByServices.get(service)?.map((obj: any) => {
        return {
          packageId: obj._id,
          name: obj.type,
          [`${obj.educationLevelId.name}_fee`.toLowerCase()]: obj.price,
          [`${obj.educationLevelId.name}_package_id`.toLowerCase()]: obj._id,
        };
      }) || [],
    };
  }

  return { names: services, withOptions: servicesWithOptions };
};

// export const getCalculatorServices = (data: any) => {
//   // const groupByServices = Object.groupBy(data, (obj: any) => {
//   //   return obj.serviceId.name.toLowerCase();
//   // });
//   function groupBy<T>(array: T[], keyGetter: (item: T) => string) {
//     const map = new Map<string, T[]>();
//     array.forEach(item => {
//         const key = keyGetter(item);
//         const collection = map.get(key);
//         if (!collection) {
//             map.set(key, [item]);
//         } else {
//             collection.push(item);
//         }
//     });
//     return map;
// }

// const groupByServices = groupBy(data, (obj: any) => {
//     return obj.serviceId.name.toLowerCase();
// });
//   const services = Object.keys(groupByServices);

//   let servicesWithOptions: any = {};
//   for (let service in groupByServices) {
//     servicesWithOptions[service] = {
//       options: groupByServices[service]
//         .map((obj: any) => {
//           return {
//             packageId: obj._id,
//             name: obj.type,
//             [`${obj.educationLevelId.name}_fee`.toLowerCase()]: obj.price,
//             [`${obj.educationLevelId.name}_package_id`.toLowerCase()]: obj._id,
//           };
//         })
//         .map((obj: any) => {
//           return {
//             ...obj,
//             graduate_package_id: obj.graduate_fee ? obj.packageId : null,
//             undergraduate_package_id: obj.undergraduate_fee
//               ? obj.packageId
//               : null,
//           };
//         })
//         .reduce((acc: any, current: any) => {
//           const existingItem = acc.find((item: any) => item.name === current.name);
//           if (existingItem) {
//             if (existingItem.graduate_package_id) {
//               existingItem.undergraduate_package_id =
//                 current.undergraduate_package_id;
//             } else {
//               existingItem.graduate_package_id = current.graduate_package_id;
//             }

//             if (current.graduate_fee) {
//               existingItem.graduate_fee =
//                 (existingItem.graduate_fee || 0) + current.graduate_fee;
//             }
//             if (current.undergraduate_fee) {
//               existingItem.undergraduate_fee =
//                 (existingItem.undergraduate_fee || 0) +
//                 current.undergraduate_fee;
//             }
//           } else {
//             acc.push(current);
//           }

//           return acc;
//         }, []),
//     };
//   }

//   return { names: services, withOptions: servicesWithOptions };
// };

export const getServiceOptions = (service: any) => {
  return (
    service?.options?.map((option: any) => {
      return {
        value: option.packageId,
        label: option.name,
      };
    }) || []
  );
};

export const convertToUTC = (dateTimeString: any) => {
  const utcDateTime = moment(dateTimeString, "MM/DD/YYYY h:mm A").utc();
  return utcDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
};

export const isEmailValid = (email: any) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  return emailRegex.test(email);
};

export const momentToReadableDate = (momentObject: any) => {
  // Check if the input is a valid Moment.js object
  if (!momentObject || !momentObject.isValid()) {
    return "Invalid date";
  }

  // Format the date according to your preference
  // You can customize the format based on your needs
  return momentObject.format("MMMM Do YYYY, h:mm:ss a");
};

export const isPhoneValid = (phone: any) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};
