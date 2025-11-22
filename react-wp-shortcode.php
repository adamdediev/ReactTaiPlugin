<?php
/**
 * Plugin Name: React WP Shortcode
 * Description: A simple plugin to render a React app via a shortcode.
 */

// Добавляем страницу настроек в админку
function dbt_currency_admin_menu() {
	add_options_page(
		'Настройки валют',
		'Валюты',
		'manage_options',
		'dbt-currency-settings',
		'dbt_currency_settings_page'
	);
}
add_action('admin_menu', 'dbt_currency_admin_menu');

// Страница настроек
function dbt_currency_settings_page() {
	if (!current_user_can('manage_options')) {
		return;
	}

	// Обработка сохранения
	if (isset($_POST['dbt_save_currencies']) && check_admin_referer('dbt_currency_settings')) {
		$currencies = [];
		
		if (isset($_POST['currencies']) && is_array($_POST['currencies'])) {
			foreach ($_POST['currencies'] as $currency) {
				if (!empty($currency['code'])) {
					$currencies[sanitize_text_field($currency['code'])] = [
						'code' => sanitize_text_field($currency['code']),
						'flag' => sanitize_text_field($currency['flag'] ?? ''),
						'icon' => sanitize_text_field($currency['icon'] ?? ''),
						'payoutMarkup' => floatval($currency['payoutMarkup'] ?? 3.0),
						'isCrypto' => isset($currency['isCrypto']) ? 1 : 0,
					];
				}
			}
		}
		
		update_option('dbt_custom_currencies', $currencies);
		echo '<div class="notice notice-success"><p>Настройки сохранены!</p></div>';
	}

	// Обработка удаления
	if (isset($_POST['dbt_delete_currency']) && check_admin_referer('dbt_delete_currency')) {
		$code = sanitize_text_field($_POST['currency_code']);
		$currencies = get_option('dbt_custom_currencies', []);
		unset($currencies[$code]);
		update_option('dbt_custom_currencies', $currencies);
		echo '<div class="notice notice-success"><p>Валюта удалена!</p></div>';
	}

	$custom_currencies = get_option('dbt_custom_currencies', []);
	?>
	<div class="wrap">
		<h1>Настройки валют</h1>
		<form method="post" action="">
			<?php wp_nonce_field('dbt_currency_settings'); ?>
			<div id="currencies-list">
				<?php if (!empty($custom_currencies)): ?>
					<?php foreach ($custom_currencies as $code => $currency): ?>
						<div class="currency-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background: #fff;">
							<h3>Валюта: <?php echo esc_html($code); ?></h3>
							<table class="form-table">
								<tr>
									<th><label>Код валюты</label></th>
									<td><input type="text" name="currencies[<?php echo esc_attr($code); ?>][code]" value="<?php echo esc_attr($currency['code']); ?>" required /></td>
								</tr>
								<tr>
									<th><label>Флаг (эмодзи или код)</label></th>
									<td><input type="text" name="currencies[<?php echo esc_attr($code); ?>][flag]" value="<?php echo esc_attr($currency['flag']); ?>" /></td>
								</tr>
								<tr>
									<th><label>Иконка</label></th>
									<td><input type="text" name="currencies[<?php echo esc_attr($code); ?>][icon]" value="<?php echo esc_attr($currency['icon'] ?? ''); ?>" /></td>
								</tr>
								<tr>
									<th><label>Наценка при выводе (%)</label></th>
									<td><input type="number" step="0.1" name="currencies[<?php echo esc_attr($code); ?>][payoutMarkup]" value="<?php echo esc_attr($currency['payoutMarkup']); ?>" /></td>
								</tr>
								<tr>
									<th><label>Криптовалюта</label></th>
									<td><input type="checkbox" name="currencies[<?php echo esc_attr($code); ?>][isCrypto]" value="1" <?php checked($currency['isCrypto'] ?? 0, 1); ?> /></td>
								</tr>
							</table>
							<form method="post" action="" style="display: inline;">
								<?php wp_nonce_field('dbt_delete_currency'); ?>
								<input type="hidden" name="currency_code" value="<?php echo esc_attr($code); ?>" />
								<input type="submit" name="dbt_delete_currency" class="button button-secondary" value="Удалить" onclick="return confirm('Вы уверены?');" />
							</form>
						</div>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			
			<h2>Добавить новую валюту</h2>
			<div class="currency-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
				<table class="form-table">
					<tr>
						<th><label>Код валюты</label></th>
						<td><input type="text" name="currencies[new][code]" placeholder="BTC, ETH, etc." /></td>
					</tr>
					<tr>
						<th><label>Флаг (эмодзи или код)</label></th>
						<td><input type="text" name="currencies[new][flag]" placeholder="🪙 или код флага" /></td>
					</tr>
					<tr>
						<th><label>Иконка</label></th>
						<td><input type="text" name="currencies[new][icon]" placeholder="URL или путь к иконке" /></td>
					</tr>
					<tr>
						<th><label>Наценка при выводе (%)</label></th>
						<td><input type="number" step="0.1" name="currencies[new][payoutMarkup]" value="3.0" /></td>
					</tr>
					<tr>
						<th><label>Криптовалюта</label></th>
						<td><input type="checkbox" name="currencies[new][isCrypto]" value="1" /></td>
					</tr>
				</table>
			</div>
			
			<?php submit_button('Сохранить настройки', 'primary', 'dbt_save_currencies'); ?>
		</form>
	</div>
	<?php
}

function dbt_render_react_wp_shortcode_app($atts) {

	$idPrefix = "dbt-react-wp-shortcode-app";
	$randomNum = rand(0, 100);

	$atts = shortcode_atts(
		[
			'id' => $randomNum, // Default ID if none is provided
		],
		$atts,
		'react_wp_shortcode_app'
	);

	$escapedID = esc_attr($atts['id']);
	$containerID = $idPrefix . '-' . $escapedID;

	wp_enqueue_script("dbt-react-wp-shortcode-app-$escapedID", plugins_url('/build/index.js', __FILE__), array('wp-element'), time(), true);
	wp_enqueue_style('dbt-react-wp-shortcode-app-style', plugins_url('/build/style-index.css', __FILE__), array(), time());

	// Получаем кастомные валюты из админки
	$custom_currencies = get_option('dbt_custom_currencies', []);
	
	$data_to_pass_to_js = [
		'containerID' => $containerID,
		'customCurrencies' => $custom_currencies,
	];

	wp_localize_script("dbt-react-wp-shortcode-app-$escapedID", 'pluginData', $data_to_pass_to_js);

	return '<div id="' . $containerID . '"></div>';
}

add_shortcode('react_wp_shortcode_app', 'dbt_render_react_wp_shortcode_app');
