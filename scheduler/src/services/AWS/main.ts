import { GetParameterCommand, GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

const ssm = new SSMClient({});

/**
 * A helper used to get secrets from the AWS SSM Parameter store
 * @throws an Error if the key is not found
 * @param name the name of the parameter
 * @returns the value as a string
 */
export const getSecret = async (name: string): Promise<string> => {
  const command = new GetParameterCommand({ Name: name, WithDecryption: true });

  const value = (await ssm.send(command)).Parameter?.Value;

  if (value === undefined) {
    logger.error(`The secret "${name}" failed to be retrieved from the AWS Parameter Store.`);
    throw new Error('The requested secret could not be found.');
  }

  return value;
};

/**
 * A helper used to get all the secrets for a path from the AWS SSM Parameter store
 * @throws an Error the path returns an undefined result
 * @param path the path name
 * @returns a list of parameter values for the provided path
 */
export async function getSecretsByPath(path: string) {
  const secret_map = new Map<string, string | undefined>();
  let current_next_token: string | undefined;

  do {
    // Note: AWS returns secrets in a maximum batch size of 10
    const command = new GetParametersByPathCommand({
      Path: path,
      Recursive: true,
      WithDecryption: true,
      NextToken: current_next_token,
    });

    const { Parameters: parameters, NextToken: next_next_token } = await ssm.send(command);

    if (!parameters) {
      logger.error(
        `Failed to retrieve the secrets for the "${path}" path from the AWS Parameter Store.`,
      );
      throw new Error(`The secrets for the "${path}" path could not be found.`);
    }

    for (const parameter of parameters) {
      if (parameter.Name) {
        secret_map.set(parameter.Name, parameter.Value);
      }
    }

    current_next_token = next_next_token;
  } while (current_next_token);

  return secret_map;
}
