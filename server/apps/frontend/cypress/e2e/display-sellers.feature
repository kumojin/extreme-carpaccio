Feature: Display sellers

        Scenario: Display sellers
                Given I'm on the website
                When There are 3 sellers
                Then I see sellers:
                        | Name     | Cash        | isOnline |
                        | Lukasz   | 60,00 €     | true     |
                        | Santane  | 12 000,21 € | false    |
                        | Faustine | 0,30 €      | true     |

        Scenario: Display sellers with updating of sellers
                Given I'm on the website
                When There are 3 sellers
                And I see sellers:
                        | Name     | Cash        | isOnline |
                        | Lukasz   | 60,00 €     | true     |
                        | Santane  | 12 000,21 € | false    |
                        | Faustine | 0,30 €      | true     |
                And there is a updating of sellers
                And I see sellers:
                        | Name     | Cash                | isOnline |
                        | Lukasz   | 10 000 023 210,00 € | true     |
                        | Santane  | 12 000,21 €         | true     |
                        | Faustine | 0,40 €              | false    |
