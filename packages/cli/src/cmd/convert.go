// Package cmd ...
package cmd

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
)

var morseMap map[rune]string = map[rune]string{
	'a': ".-",
	'b': "-...",
	'c': "-.-.",
	'd': "-..",
	'e': ".",
	'f': "..-.",
	'g': "--.",
	'h': "....",
	'i': "..",
	'j': ".---",
	'k': "-.-",
	'l': ".-..",
	'm': "--",
	'n': "-.",
	'o': "---",
	'p': ".--.",
	'q': "--.-",
	'r': ".-.",
	's': "...",
	't': "-",
	'u': "..-",
	'v': "...-",
	'w': ".--",
	'x': "-..-",
	'y': "-.--",
	'z': "--..",

	'1': ".----",
	'2': "..---",
	'3': "...--",
	'4': "....-",
	'5': ".....",
	'6': "-....",
	'7': "--...",
	'8': "---..",
	'9': "----.",
	'0': "-----",

	'.':  ".-.-.-",
	',':  "--..--",
	';':  "-.-.-.",
	':':  "---...",
	'!':  "-.-.--",
	'?':  "..--..",
	'\'': ".----.",
	'-':  "-....-",
	'(':  "-.--.",
	')':  "-.--.-",
	'"':  ".-..-.",
	'/':  "-..-.",
}

// ConvertTextToMorse converts a given text to Morse code
func ConvertTextToMorse(text string) string {
	var result []string

	// Iterate through each character of the input text
	for _, character := range text {
		// Convert character to lowercase
		lowerCharacter := rune(strings.ToLower(string(character))[0])

		// Look up Morse code for the character, if available
		code, found := morseMap[lowerCharacter]
		if found {
			result = append(result, code)
		} else {
			// If no Morse code exists, add the character itself
			result = append(result, string(character))
		}
	}

	// Join the Morse code and return as a string
	return strings.Join(result, "")
}

// morseCmd represents the morse command
var convertCmd = &cobra.Command{
	Use:   "convert",
	Short: "Run the morse operation for the string app",
	Long: `The morse command is a specific utility to execute operations related to morse within the string application.

As a component of the devtools tools, this command empowers you to interact directly with string's morse features via the CLI.`,
	Run: func(cmd *cobra.Command, args []string) {

		// Get URL
		fmt.Print("Text: ")
		var text string
		fmt.Scanln(&text)
		fmt.Printf("Converting: %s\n", text)
		// Convert to Morse
		morseCode := ConvertTextToMorse(text)
		fmt.Println("Morse Code:", morseCode)
	},
}

func init() {
	rootCmd.AddCommand(convertCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// morseCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// morseCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
