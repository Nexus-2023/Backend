interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }

   
  interface Validator {
    public_key: string;
    validator_index: number;
    cluster_id: number;
    balance: number;  
    status: boolean;
    last_update_time: string;
    score: number;
    rollupname: string;
  }
  
  interface ValidatorsResponse {
    data: Validator[];
  }


  export { DatabaseConfig ,Validator , ValidatorsResponse }