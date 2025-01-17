Feature: Creation a seller

        Scenario: Create a seller with success
                Given I'm a Seller
                When I write the field "input" "username" with "Xavier"
                Then  I write the field "input" "password" with "Sup3rP4ssw0rd"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I see on the tab "Xavier" with "0,00 €"
                Then I don't see an error message: "An error occurred during registration"

        Scenario: Create a seller with error server
                Given I'm a Seller
                When I write the field "input" "username" with "Anne-Marie"
                Then  I write the field "input" "password" with "Sup3rP4ssw0rd"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I see an error message: "An error occured during registration: Not Found"
                Then I don't see on the tab "Anne-Marie" with "0,00 €"

        Scenario: Create a seller with error form : no password
                Given I'm a Seller
                When  I write the field "input" "username" with "Xavier"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I see an error message for the input: "password"
                Then I don't see on the tab "Xavier" with "0,00 €"
                Then I don't see an error message: "An error occurred during registration"

        Scenario: Create a seller with error form : no username
                Given I'm a Seller
                Then  I write the field "input" "password" with "pass"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I see an error message for the input: "name"
                Then I don't see on the tab "Anne-Marie" with "0,00 €"
                Then I don't see an error message: "An error occurred during registration"


        Scenario: Create a seller with error form : no url
                Given I'm a Seller
                When  I write the field "input" "username" with "Xavier"
                Then  I write the field "input" "password" with "newPassword"
                Then I click on the button "Register"
                Then I see an error message for the input: "url"
                Then I don't see on the tab "Anne-Marie" with "0,00 €"
                Then I don't see an error message: "An error occurred during registration"

        Scenario: Reset form with success after clik on the button
                Given I'm a Seller
                When  I write the field "input" "username" with "Xavier"
                Then  I write the field "input" "password" with "newPassword"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I observe the reset of input

        Scenario: no reset form with error after clik on the button
                Given I'm a Seller
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I observe the field "input" "url" with "http://192:168:1.1:4300"

        Scenario: Create a seller with error 500
                Given I'm a Seller
                When  I write the field "input" "username" with "Sandrine"
                Then  I write the field "input" "password" with "Sup3rP4ssw0rd"
                Then I write the field "input" "url" with "http://192:168:1.1:4300"
                Then I click on the button "Register"
                Then I see an error message: "An error occured during registration: Internal Server Error"
                Then I don't see on the tab "Sandrine" with "0,00 €"
