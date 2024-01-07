import { Construct } from 'constructs';
import { Chart } from 'cdk8s';
import {Deployment} from "cdk8s-plus-27";

class SentryChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new Deployment(this, 'test', {

    })
  }
}