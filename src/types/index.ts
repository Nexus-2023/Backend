export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }

   
  export interface Validator {
    public_key: string;
    validator_index: number;
    cluster_id: string;
    balance: number;  
    status: string;    
    score: number;
    rollupname: string;
  }


  export interface Block{
    block_number: number;
    block_proposer: number;
    slot: string;
    root: string;  
    parent_root: string;    
    validator_exit: string;
    withdrawals: string;
    proposer_slashings: string;
    finalized: string;
  }

  export interface subgraphValidator {
    clusterId: string;
    id: string;
    rollup: string;
    status: string;
  }
  
  export interface ValidatorData {
    validators:  subgraphValidator[];
  }
  
  export interface validatorSubgraphResult {
    data: ValidatorData;
  }



  
  export interface ValidatorsResponse {
    data: Validator[];
  }


 