%{
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <string>
#include <sstream>
#include <unordered_map>
#include <vector>
#include <numeric>
#include <iostream>
#include <random>

#define set_is_var(x) is_var.push_back(x)

char s_buffer[256];
bool extends_mode_on = false;
bool active_class_extends = false;

std::unordered_map<std::string,std::string> variables;
std::vector<bool> is_var;

std::unordered_map<std::string,std::vector<std::string>> classes;
std::vector<std::string> parent_classes;
bool marked_important = false;

char active_class[256];

void register_class(const char* s){
	if(extends_mode_on){
		parent_classes.push_back(std::string(s));
	}else{
		printf("\n%s",s);
		strcpy(active_class,s);
	}
}

void output_properties(){
	extends_mode_on = false;
	if(active_class_extends){
		for(auto p: parent_classes){
			for(auto s: classes[p]){
				std::cout<< s <<";";
				classes[active_class].push_back(s);
			}
		}
		//reset
		active_class_extends = false;
		parent_classes.clear();
	}
}
const int random_index(size_t limit=0) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(0, limit);

        // Generate a random index
        return  dis(gen);
}

const char* select_random_from_values(const std::string& input) {
    std::vector<std::string> tokens;
    std::string token;
    std::stringstream ss(input);

    while (std::getline(ss, token, ',')) {
        tokens.push_back(token);
    }

    return tokens[random_index(tokens.size()-1)].c_str();
}

void yyerror(const char* s);
int yylex(void);

%}

%define parse.error custom

%union{
    char* string;
}

%token OPENING_BRACES
%token CLOSING_BRACES
%token PROPERTY_SEPARATOR
%token PAIR_SEPARATOR
%token ASSIGN
%token EXTENDS
%token ALIAS
%token SCALAR
%token WHITESPACE
%token IMP_MARKER

%token <string> PROPERTY_NAME
%token <string> IDENTIFIER
%token <string> CLASS_NAME
%token <string> TEXT
%token <string> COMMENT

%nterm <string> valid_value
%nterm <string> array

%%

css: opt_whitespace css 
	| variable css 
	| class_definition css
	| comment css  
	| aliasing css
	| class_definition
	| comment 
	| aliasing
	;

aliasing: CLASS_NAME opt_whitespace ALIAS opt_whitespace CLASS_NAME opt_whitespace PROPERTY_SEPARATOR 
	{
		register_class($5);
		std::cout<<"{";
		extends_mode_on = true;
		register_class($1);
		active_class_extends = true;
		output_properties();
		std::cout<<"\n}";
	};

class_definition:  selectors opt_extends_class_names open_brace class_body close_brace opt_whitespace 
		|  CLASS_NAME opt_whitespace PROPERTY_SEPARATOR opt_whitespace {std::cout<<"\n"<<$1<<";";}
		;

class_body: opt_whitespace 
	| comment 
	| property_pairs 
	| class_body opt_whitespace 
	| class_body comment
	| class_body property_pairs 
	;
	;

array:	OPENING_BRACES valid_value CLOSING_BRACES {$$=strdup(select_random_from_values($2));};

variable: SCALAR IDENTIFIER opt_whitespace ASSIGN opt_whitespace valid_value opt_whitespace PROPERTY_SEPARATOR {variables[$2]=std::string($6);set_is_var(true);}
        |        IDENTIFIER opt_whitespace ASSIGN opt_whitespace valid_value opt_whitespace PROPERTY_SEPARATOR {variables[$1]=std::string($5);set_is_var(false);}
        |        IDENTIFIER opt_whitespace ASSIGN opt_whitespace array opt_whitespace PROPERTY_SEPARATOR {variables[$1]=std::string($5);set_is_var(false);}
	;

open_brace: 	OPENING_BRACES {
		  	printf("{");
			output_properties();
		};

close_brace: 	CLOSING_BRACES {printf("\n}");};

selectors: class_names
	 | IDENTIFIER opt_whitespace { printf("\n%s",$1);}
	 | IDENTIFIER opt_whitespace selectors { printf("\n%s",$1);}
	 ;

class_names: CLASS_NAME 				{register_class($1);}
	   | CLASS_NAME opt_whitespace 			{register_class($1);}
	   | CLASS_NAME opt_whitespace class_names 	{register_class($1);}
	   ;

opt_extends_class_names: EMPTY 
		        | extends opt_whitespace class_names 
			;

extends: EXTENDS {extends_mode_on = true;active_class_extends = true;}
 
property_pairs: property_pair opt_whitespace property_separator opt_whitespace
	      | property_pair opt_whitespace 
	      | property_pair opt_whitespace property_separator opt_whitespace property_pairs opt_whitespace 
	      ;

property_pair: opt_important PROPERTY_NAME opt_whitespace PAIR_SEPARATOR opt_whitespace valid_value 
	     {
		std::string t = "\n\t"+std::string($2)+" : "+std::string($6);
		std::cout<< t;
		if(marked_important)
			printf(" !important ");
		classes[active_class].push_back(t);
	     };

valid_value: TEXT 			{$$=$1;}
           | IDENTIFIER 		{auto f_iter= variables.find($1);if(f_iter!=variables.end()) {
						if(is_var[std::distance(variables.begin(),f_iter)]){
							char t[256];
							sprintf(t,"var(--%s)",$1);
							strcpy($$,t);
							//std::cout<< "\n$$-ii: "<<$$;
						}else{
							$$=strdup(variables[$1].c_str());
							//std::cout<< "\n$$-ie: "<<$$;

						}
					}}
           | valid_value TEXT 		{$$=strcat($$,$2);}
           | valid_value IDENTIFIER 	{auto f_iter= variables.find($2);if(f_iter!=variables.end()) {
						if(is_var[std::distance(variables.begin(),f_iter)]){
							char t[256];
							sprintf(t,"var(--%s)",$2);
							$$ = strcat($1,t);
							//std::cout<< "\n$$e-ii: "<<$$;
						}else{
							char t[256];
							strcpy(t,strdup(variables[$2].c_str()));
							$$ = strcat($$,t);
							//std::cout<< "\n$$e-ie: "<<$$;
						}
					}else{
						$$=strcat($$,$2);
						//std::cout<< "\n$$e-e: "<<$$;
					}
					}
           | valid_value WHITESPACE 	{$$=strcat($$," ");}
           ;

opt_important: EMPTY 	  {marked_important = false;}
	     | IMP_MARKER {marked_important = true;};
property_separator : PROPERTY_SEPARATOR {printf(";");};

EMPTY: /*empty*/;
opt_whitespace: EMPTY 
	      | WHITESPACE opt_whitespace 
	      ;
		
comment: COMMENT {printf("%s",$1);}

%%

void finally(){
	//print :root block
	bool any_vars = std::accumulate(is_var.begin(), is_var.end(), false, [](bool a,bool b){return a or b;});
	if(any_vars){
		std::cout<< "\n:root{";
		uint i = 0;
		for(const auto& [k,v]: variables){
			if (is_var[i])
				std::cout<< "\n\t--"<<k<<":"<<v<<";";
			i++;
		}
		std::cout<< "\n}";
	}
}

int yywrap(void) {return 1;}

void yyerror(const char* s) {
    printf("\nError: %s\n", s);
}

static int yyreport_syntax_error (const yypcontext_t *ctx) { 
	int res = 0; 
	YY_LOCATION_PRINT (stderr, *yypcontext_location (ctx));
	fprintf (stderr, ": syntax error");
	 // Report the tokens expected at this point. 
	{ 
		enum { TOKENMAX = 5 };
		yysymbol_kind_t expected[TOKENMAX];
		int n = yypcontext_expected_tokens (ctx, expected, TOKENMAX);
		if (n < 0) // Forward errors to yyparse. 
			res = n; 
		else
			for (int i = 0; i < n; ++i) 
				fprintf (stderr, "%s %s", i == 0 ? ": expected" : " or", yysymbol_name (expected[i])); 
	} // Report the unexpected token. 
	{ 
		yysymbol_kind_t lookahead = yypcontext_token (ctx); 
		if (lookahead != YYSYMBOL_YYEMPTY) 
		fprintf (stderr, " before %s at ", yysymbol_name (lookahead)); 
		YY_LOCATION_PRINT (stderr, *yypcontext_location (ctx));
	} 
		fprintf (stderr, "\n"); 
		return res;
}
int main() {
    yyparse();
    finally();
    return 0;
}

